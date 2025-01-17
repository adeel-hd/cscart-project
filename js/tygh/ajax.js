(function (_, $) {
  var loadedScripts = {};
  var loadedScriptPromises = {};
  var sessionData = {};
  (function ($) {
    var REQUEST_XML = 1;
    var REQUEST_IFRAME = 2;
    var REQUEST_COMET = 3;
    var REQUEST_JSONP_POST = 5;
    var QUERIES_LIMIT = 1;
    var queryStack = [];
    var activeQueries = 0;
    var evalCache = {};
    var responseCache = {};
    var getScriptQueries = 0;
    var oldjQuery = {};

    /*
     * Public methods
     */
    var methods = {
      request: function (url, params) {
        params = params || {};
        params.method = params.method || 'get';
        params.data = params.data || {};
        params.message = params.message || _.tr('loading');
        params.caching = params.caching || false;
        params.hidden = params.hidden || false;
        params.repeat_on_error = params.repeat_on_error || false;
        params.force_exec = params.force_exec || false;
        params.obj = params.obj || null;
        params.append = params.append || null;
        params.scroll = params.scroll || null;
        params.overlay = params.overlay || null;
        params.original_url = _.current_url || null;
        params.get_promise = params.get_promise || null;
        if (_.embedded) {
          params.full_render = true;
        }
        if (params.full_render) {
          params.data.full_render = params.full_render;
        }
        if (typeof params.data.security_hash == 'undefined' && typeof _.security_hash != 'undefined' && params.method.toLowerCase() == 'post') {
          params.data.security_hash = _.security_hash;
        }
        if (params.result_ids) {
          params.data.result_ids = params.result_ids;
        }
        if (params.skip_result_ids_check) {
          params.data.skip_result_ids_check = params.skip_result_ids_check;
        }
        if (activeQueries >= QUERIES_LIMIT) {
          // if we have queries in the queue, push request to it
          var result = true;
          if (params.get_promise) {
            params.defered_object = methods.createDeferedObject();
            result = methods.createPromise(params.defered_object);
          }
          queryStack.unshift(function () {
            methods.request(url, params);
          });
          return result;
        }
        if (params.defered_object && params.defered_object.isAborted) {
          params.defered_object.reject({}, 'abort', 'abort');
          methods.executeNext();
          return false;
        }

        // If query is not hidden, display loading box
        if (params.hidden === false) {
          $.toggleStatusBox('show', {
            show_overlay: params.show_overlay,
            overlay: params.overlay
          });
        }
        var hash = '';
        if (params.caching === true) {
          hash = $.crc32(url + $.param(params.data));
        }
        if (!hash || !responseCache[hash]) {
          // Check, if we need to save all the input fields values from the updated element
          var saved_data = {};
          var result_ids = params.data.result_ids ? params.data.result_ids.split(',') : [];
          if (result_ids.length > 0) {
            for (var j = 0; j < result_ids.length; j++) {
              var container = $(document.getElementById(result_ids[j]));
              var $save_fields_block = container.find('.cm-save-fields');
              if (container.hasClass('cm-save-fields')) {
                saved_data[result_ids[j]] = $(':input:visible', container).serializeArray();
              } else if ($save_fields_block.length) {
                saved_data[result_ids[j]] = $(':input:visible', $save_fields_block).serializeArray();
              }
            }
            params.saved_data = saved_data;
          }
          if (url) {
            url = fn_query_remove(url, 'result_ids');
            if (url.indexOf('://') == -1) {
              url = _.current_location + '/' + url;
            }
            if (params.obj && params.obj.hasClass('cm-comet')) {
              params.url = url + '&result_ids=' + params.result_ids + '&is_ajax=' + REQUEST_COMET;
              return transports.iframe(null, params, {
                is_comet: true
              });
            } else {
              activeQueries++;
              var data_type = !$.support.cors && url.indexOf('://' + window.location.hostname) == -1 ? 'jsonp' : 'json';
              if (!('is_ajax' in params.data) && data_type == 'json') {
                params.data.is_ajax = REQUEST_XML;
              }
              if (sessionData.name && url.indexOf(sessionData.name) == -1) {
                params.data[sessionData.name] = localStorage.getItem(sessionData.name);
              }
              var components = $.parseUrl(url);
              if (components.anchor) {
                params.data.anchor = components.anchor;
              }
              var jqXHR = $.ajax({
                type: params.method,
                url: url,
                dataType: data_type,
                cache: true,
                data: params.data,
                xhrFields: {
                  withCredentials: true
                },
                success: function (data, textStatus) {
                  if (hash) {
                    // cache response
                    responseCache[hash] = data;
                  }
                  _response(data, params);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                  if (textStatus === 'abort') {
                    // Hide loading box
                    $.toggleStatusBox('hide');
                    return false;
                  }

                  // Repeat the query on the error response
                  if (params.repeat_on_error) {
                    params.repeat_on_error = false;
                    methods.request(url, params);
                    return false;
                  }

                  // Hide loading box
                  $.toggleStatusBox('hide');

                  // If query is not hidden, display error notice
                  if (params.hidden === false && errorThrown) {
                    var err_msg = _.tr('error_ajax').str_replace('[error]', errorThrown);
                    $.ceNotification('show', {
                      type: 'E',
                      title: _.tr('error'),
                      message: err_msg
                    });
                  }
                  if (params.error_callback && typeof params.error_callback == 'function') {
                    params.error_callback(XMLHttpRequest, textStatus, errorThrown);
                  }
                },
                complete: function (XMLHttpRequest, textStatus) {
                  methods.executeNext();
                }
              });
              if (params.get_promise) {
                if (params.defered_object) {
                  var deferedObject = params.defered_object;
                } else {
                  var deferedObject = methods.createDeferedObject();
                }
                methods.bindXhrToDeferedObject(jqXHR, deferedObject);
                return methods.createPromise(deferedObject);
              } else {
                return jqXHR;
              }
            }
          }
        } else if (hash && responseCache[hash]) {
          var result = false;
          _response(responseCache[hash], params);
          if (params.get_promise) {
            var deferedObject = methods.createDeferedObject();
            var result = methods.createPromise(deferedObject);
            deferedObject.resolve(responseCache[hash]);
          }
          methods.executeNext();
          return result;
        }
        return false;
      },
      submitForm: function (form, clicked_elm) {
        if (activeQueries >= QUERIES_LIMIT) {
          // if we have queries in the queue, push request to it
          queryStack.unshift(function () {
            var submit_name = clicked_elm.attr('name'),
              submit_value = clicked_elm.val(),
              input;
            if (submit_name) {
              input = $('<input>', {
                type: 'hidden',
                value: submit_value,
                name: submit_name
              }).appendTo(form);
            }
            if (methods.submitForm(form, clicked_elm)) {
              form.get(0).submit();
            }
            if (input) {
              input.remove();
            }
          });
          return false; // prevent default form submit
        }
        var params = {
          form: form,
          obj: clicked_elm,
          scroll: clicked_elm.data('caScroll') || '',
          overlay: clicked_elm.data('caOverlay') || '',
          callback: 'ce.formajaxpost_' + form.prop('name')
        };
        $.ceNotification('closeAll');
        $.toggleStatusBox('show', {
          show_overlay: params.show_overlay,
          overlay: params.overlay
        });
        var options = _getOptions(form, params);
        if (options.force_exec) {
          params['force_exec'] = true;
        }
        if (sessionData.name) {
          form.append('<input type="hidden" name="' + sessionData.name + '" value="' + localStorage.getItem(sessionData.name) + '">');
        }
        if (options.full_render) {
          form.append('<input type="hidden" name="full_render" value="Y">');
        }
        form.append('<input type="hidden" name="is_ajax" value="' + (options.transport == 'iframe' ? options.is_comet ? REQUEST_COMET : REQUEST_IFRAME : options.transport == 'jsonpPOST' ? REQUEST_JSONP_POST : REQUEST_XML) + '">');
        return transports[options.transport](form, params, options);
      },
      inProgress: function () {
        return activeQueries !== 0;
      },
      clearCache: function () {
        responseCache = {};
        return true;
      },
      response: function (response, params) {
        return _response(response, params);
      },
      executeNext: function () {
        activeQueries--;
        if (queryStack.length) {
          var f = queryStack.shift();
          f();
        }
      },
      createDeferedObject: function () {
        var deferredObject = $.Deferred();
        deferredObject.jqXHR = null;
        deferredObject.isAborted = false;
        deferredObject.abort = function () {
          deferredObject.isAborted = true;
          if (deferredObject.jqXHR) {
            deferredObject.jqXHR.abort();
          }
        };
        return deferredObject;
      },
      bindXhrToDeferedObject: function (jqXHR, deferredObject) {
        jqXHR.done(deferredObject.resolve);
        jqXHR.fail(deferredObject.reject);
        deferredObject.jqXHR = jqXHR;
      },
      createPromise: function (deferredObject) {
        var promise = deferredObject.promise();
        promise.abort = function () {
          deferredObject.abort();
        };
        return promise;
      }
    };

    /*
     * AJAX transports
     */
    var transports = {
      /*
       * Transport for file uploads or COMET requests
       */
      iframe: function (form, params, options) {
        var iframe = $('<iframe name="upload_iframe" src="about:blank" class="hidden"></iframe>').appendTo(_.body);
        activeQueries++;
        if (options.is_comet && $('#comet_control:visible').length === 0) {
          $('#comet_container_controller').ceProgress('init');
        }
        iframe.on('load', function () {
          var response = {};
          var self = $(this);
          if (self.contents().text() !== null) {
            eval('var response = ' + self.contents().find('textarea').val());
          }
          response = response || {};
          _response(response, params);
          if (options.is_comet && jQuery.isEmptyObject(response) == false) {
            if (typeof response.comet_is_finished === 'undefined') {
              response.comet_is_finished = true;
            }
            if (response.comet_is_finished) {
              $('#comet_container_controller').ceProgress('finish');
            }
            $.ceEvent('trigger', 'ce.cometdone', [form, params, options, response]);
          }
          self.remove();
          activeQueries--;
          if (queryStack.length) {
            var f = queryStack.shift();
            f();
          }
        });

        // We can send form, or open URL
        if (form) {
          form.prop('target', 'upload_iframe');
        } else if (params.url) {
          if (params.method == 'post') {
            $('<form class="hidden" action="' + params.url + '" method="post" target="upload_iframe"><input type="hidden" name="security_hash" value="' + _.security_hash + '"></form>').appendTo(_.body).submit();
          } else {
            iframe.prop('src', params.url);
          }
        }
        return true;
      },
      /*
       * Transport for requests via XMLHttpRequest(2)
       */
      xml: function (form, params) {
        if (form.hasClass('cm-outside-inputs')) {
          var hash = form.serializeObject();
        } else {
          var hash = $(':input', form).serializeObject();
        }

        // Send name/value of clicked button
        if (params.obj && params.obj.prop('name')) {
          hash[params.obj.prop('name')] = params.obj.val();
        }
        params['method'] = form.prop('method');
        params['data'] = hash;
        params['result_ids'] = form.data('caTargetId');
        methods.request(form.prop('action'), params);
        return false; // prevent default form action
      },
      /*
       * Transport for cross-domain form submit if XMLHttpRequest2 is not supported
       */
      jsonpPOST: function (form, params, options) {
        $.receiveMessage(function (e) {
          if (options.is_comet) {
            $('#comet_container_controller').ceProgress('finish');
          }
          iframe.remove();
          _response($.parseJSON(e.data), params);
          activeQueries--;
        });
        var iframe = $('<iframe name="upload_iframe" src="about:blank" class="hidden"></iframe>').appendTo(_.body);
        activeQueries++;
        if (options.is_comet) {
          $('#comet_container_controller').ceProgress('init');
        }

        // We can send form, or open URL
        if (form) {
          form.prop('target', 'upload_iframe');
        } else if (params.url) {
          iframe.prop('src', params.url);
        }
        return true;
      }
    };

    /*
     * Private methods
     */
    function _getOptions(obj, params) {
      var is_comet = obj.hasClass('cm-comet') || params.obj && params.obj.hasClass('cm-comet');
      var transport = 'xml';
      var uploads = is_comet;
      if (!is_comet && obj.prop('enctype') == 'multipart/form-data') {
        obj.find('input[type=file]').each(function () {
          if ($(this).val()) {
            uploads = true;
          }
        });
      }
      if ((!$.support.cors || _.embedded && uploads) && obj.prop('action').indexOf('//') != -1 && obj.prop('action').indexOf('//' + window.location.hostname) == -1 && obj.prop('method') == 'post') {
        transport = 'jsonpPOST';
      } else if (uploads) {
        transport = 'iframe';
      }
      return {
        'full_render': obj.hasClass('cm-ajax-full-render'),
        'is_comet': is_comet,
        'force_exec': obj.hasClass('cm-ajax-force'),
        'transport': transport
      };
    }
    function _response(response, params) {
      params = params || {};
      params.force_exec = params.force_exec || false;
      params.pre_processing = params.pre_processing || {};

      // Use parameter 'data-no-execute="§"' to prevent the script from executing.
      var regex_all = new RegExp('<script[^>§]*>([\u0001-\uFFFF]*?)</script>', 'img');
      var matches = [];
      var match = '';
      var elm;
      var data = response || {};
      var inline_scripts = null;
      var scripts_to_load = [];
      var elms = [];
      var content;

      // If pre processing function passed, run it
      if (params.pre_processing && typeof params.pre_processing == 'function') {
        params.pre_processing(data, params);
      }

      // Ajax request forces browser to redirect
      if (data.force_redirection) {
        // Hide loading box
        $.toggleStatusBox('hide');
        $.redirect(data.force_redirection);
        return true;
      }

      // add hashes of current scripts
      if ($.isEmptyObject(evalCache)) {
        $('script:not([src])').each(function () {
          var self = $(this);
          evalCache[$.crc32(self.html())] = true;
        });
      }
      if (data.html) {
        for (var k in data.html) {
          elm = $(document.getElementById(k));
          if (elm.length != 1 || data.html[k] === null) {
            continue;
          }

          // If returned data contains forms and we're inside the form, move it to body
          if (data.html[k].indexOf('<form') != -1 && elm.parents('form').length) {
            $(_.body).append(elm);
          }
          matches = data.html[k].match(regex_all);
          content = matches ? data.html[k].replace(regex_all, '') : data.html[k];

          // Clean up any editors initialized inside of the target DOM element
          $('textarea.cm-wysiwyg', elm).each(function () {
            $(this).ceEditor('destroy');
          });
          $.ceDialog('destroy_loaded', {
            content: content
          });
          if (params.append) {
            elm.append(content);
          } else {
            elm.html(content);
          }
          $.ceDialog('destroy_loaded_post');

          // Restore saved data
          if (typeof params.saved_data != 'undefined' && typeof params.saved_data[k] != 'undefined') {
            var elements = [];
            for (var i in params.saved_data[k]) {
              elements[params.saved_data[k][i]['name']] = params.saved_data[k][i]['value'];
            }
            $(':input:visible', elm).each(function (id, local_elm) {
              var jelm = $(local_elm);
              if (typeof elements[jelm.prop('name')] != 'undefined' && !jelm.parents().hasClass('cm-skip-save-fields')) {
                if (jelm.prop('type') == 'radio') {
                  if (jelm.val() == elements[jelm.prop('name')]) {
                    jelm.prop('checked', true);
                  }
                } else {
                  jelm.val(elements[jelm.prop('name')]);
                }
                jelm.trigger('change');
              }
            });
          }

          // Display/hide hidden block wrappers
          if (elm.html().trim()) {
            elm.parents('.hidden.cm-hidden-wrapper').removeClass('hidden');
          } else {
            elm.parents('.cm-hidden-wrapper').addClass('hidden');
          }

          // If returned data contains scripts, execute them
          var all_scripts = null,
            ext_scripts = null;
          if (matches) {
            all_scripts = $(matches.join('\n'));
            ext_scripts = all_scripts.filter('[src]');
            inline_scripts = inline_scripts ? inline_scripts.add(all_scripts.filter(':not([src])')) : all_scripts.filter(':not([src])');
            if (ext_scripts.length) {
              for (var i = 0; i < ext_scripts.length; i++) {
                var _src = ext_scripts.eq(i).prop('src');
                if (loadedScripts[_src]) {
                  if (ext_scripts.eq(i).hasClass('cm-ajax-force')) {
                    loadedScripts[_src] = null;
                  } else {
                    continue;
                  }
                }
                if (ext_scripts.eq(i).hasClass('cm-ajax-skip-load')) {
                  continue;
                }
                scripts_to_load.push($.getScript(_src));
              }
            }
          }
          elms.push(elm);
        }

        // If content was updated inside in non-resizable dialog, reload it
        if ($.ceDialog('inside_dialog', {
          jelm: elm
        })) {
          $.ceDialog('reload_parent', {
            jelm: elm
          });
        }
        if (response.title) {
          $(document).prop('title', response.title);
        }
      }
      var done_event = function () {
        $.ceEvent('trigger', 'ce.ajaxdone', [elms, inline_scripts, params, data, response.text || '']);
      };
      if (scripts_to_load.length) {
        $.when.apply(null, scripts_to_load).then(done_event);
      } else {
        done_event();
      }
    }

    // Override default ajax method to get count of loaded scripts
    var ajax = $.ajax;
    $.ajax = function (origSettings) {
      if (origSettings.dataType && origSettings.dataType === 'script') {
        var _src = origSettings.url,
          promise;
        if (loadedScripts[_src]) {
          promise = _src in loadedScriptPromises ? loadedScriptPromises[_src] : $.Deferred().resolve().promise();
          if ('success' in origSettings) {
            promise.done(origSettings.success);
          }
        } else {
          promise = ajax(origSettings);
          loadedScripts[_src] = true;
          loadedScriptPromises[_src] = promise;
        }
        return promise;
      }
      return ajax(origSettings);
    };

    // Override getScript to prepend relative paths with full URL
    $.getScript = function (url, callback) {
      url = url.indexOf('//') == -1 ? _.current_location + '/' + url : url;
      if (_.otherjQ && getScriptQueries === 0) {
        oldjQuery = jQuery;
        jQuery = _.$;
      }
      getScriptQueries++;
      return $.ajax({
        type: "GET",
        url: url,
        success: function (data, textStatus, jqxhr) {
          getScriptQueries--;
          if (_.otherjQ && getScriptQueries === 0) {
            _.$ = jQuery;
            jQuery = oldjQuery;
          }
          if (callback) {
            callback(data, textStatus, jqxhr);
          }
        },
        dataType: "script",
        cache: true
      });
    };

    // This event executes after all scripts from ajax response are executed
    $.ceEvent('on', 'ce.ajaxdone', function (elms, scripts, params, response_data, response_text) {
      var i;

      // For full page reload in embedded mode if language was changed
      if (_.embedded && response_data.language_changed) {
        _.embedded = false;
        $.redirect(response_data.current_url, false);
        window.location.reload(true);
        return;
      }

      // If callback function passed, run it
      if (params.on_ajax_done && typeof params.on_ajax_done == 'function') {
        params.on_ajax_done(response_data, params, response_text);
      }
      if (scripts) {
        for (i = 0; i < scripts.length; i++) {
          var _hash = $.crc32(scripts.eq(i).html());
          if (!evalCache[_hash] || params.force_exec || scripts.eq(i).hasClass('cm-ajax-force')) {
            $.globalEval(scripts.eq(i).html());
            evalCache[_hash] = true;
          }
        }
      }
      if (response_data.debug_info) {
        console.log(response_data.debug_info);
      }
      var link_history = params.save_history && (!params.obj || params.obj && $.ceDialog('inside_dialog', {
        jelm: params.obj
      }) === false);
      if (response_data.session_data) {
        sessionData = response_data.session_data;
        localStorage.setItem(sessionData.name, sessionData.id);
      }
      if (response_data.current_url) {
        var current_url = decodeURIComponent(response_data.current_url);
        if (!params.skip_history && (_.embedded || link_history)) {
          var _params = params;
          if (!link_history) {
            _params.result_ids = _.container;
          }
          if (response_data.anchor) {
            current_url += '#' + response_data.anchor;
          }
          $.ceHistory('load', current_url, _params, true);
          _.current_url = current_url; // update current_url parameter in Tygh namespace
        }
        if (response_data.anchor) {
          params.scroll = response_data.anchor;
          _.anchor = '#' + response_data.anchor;
        }
      }
      for (i = 0; i < elms.length; i++) {
        $.commonInit(elms[i]);
      }

      // Enable disabled form fields back if we submitted form
      if (params.form) {
        $('input[name=is_ajax]', params.form).remove();
        $('input[name=full_render]', params.form).remove();
        if (params.form.hasClass('cm-disable-empty') || params.form.hasClass('cm-disable-empty-all') || params.form.hasClass('cm-disable-empty-files')) {
          $('input.cm-disabled', params.form).prop('disabled', false).removeClass('cm-disabled');
        }
        if (params.form.data('caAjaxDoneEvent')) {
          $.ceEvent('trigger', params.form.data('caAjaxDoneEvent'), [response_data, params, response_text]);
        }
      }

      // If callback function passed, run it
      if (params.callback && $.isFunction(params.callback)) {
        params.callback(response_data, params, response_text);
      } else if (params.callback) {
        $.ceEvent('trigger', params.callback, [response_data, params, response_text]);
      }

      // Hide loading box
      if (!params.keep_status_box) {
        $.toggleStatusBox('hide');
      }
      if (params.scroll) {
        if (!_.scrolling) {
          $.scrollToElm(params.scroll);
        }
      }

      // Display notification
      if (response_data.notifications) {
        $.ceNotification('showMany', response_data.notifications);
      }
    });
    $.ceAjax = function (method) {
      if (methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else if (typeof method === 'object' || !method) {
        return methods.init.apply(this, arguments);
      } else {
        $.error('ty.ajax: method ' + method + ' does not exist');
      }
    };
  })($);
  $(document).ready(function () {
    $('script').each(function () {
      var _src = $(this).prop('src');
      if (_src) {
        loadedScripts[_src] = true;
      }
    });
    if (typeof ajax_callback_data != 'undefined' && ajax_callback_data) {
      $.globalEval(ajax_callback_data);
      ajax_callback_data = false;
    }
  });
})(Tygh, Tygh.$);