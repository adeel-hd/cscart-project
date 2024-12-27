<?php
/* Smarty version 4.3.0, created on 2024-12-26 01:51:28
  from 'C:\xampp\htdocs\cscart\design\backend\templates\addons\vendor_panel_configurator\hooks\index\index_container.pre.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '4.3.0',
  'unifunc' => 'content_676d2720be66e7_60418828',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '284266cae50ea03574e71961addba24f5ca6374b' => 
    array (
      0 => 'C:\\xampp\\htdocs\\cscart\\design\\backend\\templates\\addons\\vendor_panel_configurator\\hooks\\index\\index_container.pre.tpl',
      1 => 1728377996,
      2 => 'tygh',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_676d2720be66e7_60418828 (Smarty_Internal_Template $_smarty_tpl) {
if ($_smarty_tpl->tpl_vars['runtime']->value['customization_mode']['theme_editor']) {?>
    <?php $_smarty_tpl->_assignInScope('html_class', ((string)$_smarty_tpl->tpl_vars['html_class']->value)." te-theme-editor-active" ,false ,2);
}
}
}
