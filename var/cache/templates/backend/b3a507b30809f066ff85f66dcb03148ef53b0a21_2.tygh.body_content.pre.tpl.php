<?php
/* Smarty version 4.3.0, created on 2024-12-26 01:51:32
  from 'C:\xampp\htdocs\cscart\design\backend\templates\addons\vendor_panel_configurator\hooks\index\body_content.pre.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '4.3.0',
  'unifunc' => 'content_676d2724bf4f29_75880441',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'b3a507b30809f066ff85f66dcb03148ef53b0a21' => 
    array (
      0 => 'C:\\xampp\\htdocs\\cscart\\design\\backend\\templates\\addons\\vendor_panel_configurator\\hooks\\index\\body_content.pre.tpl',
      1 => 1728377996,
      2 => 'tygh',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_676d2724bf4f29_75880441 (Smarty_Internal_Template $_smarty_tpl) {
if ($_smarty_tpl->tpl_vars['runtime']->value['customization_mode']['theme_editor']) {?>
    <?php $_smarty_tpl->_assignInScope('main_container_class', ((string)$_smarty_tpl->tpl_vars['main_container_class']->value)." te-mode" ,false ,2);
}
}
}
