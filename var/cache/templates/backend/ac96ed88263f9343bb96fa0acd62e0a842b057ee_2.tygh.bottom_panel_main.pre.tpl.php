<?php
/* Smarty version 4.3.0, created on 2024-12-26 01:51:33
  from 'C:\xampp\htdocs\cscart\design\backend\templates\addons\vendor_panel_configurator\hooks\bottom_panel\bottom_panel_main.pre.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '4.3.0',
  'unifunc' => 'content_676d2725ce00e1_17085820',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'ac96ed88263f9343bb96fa0acd62e0a842b057ee' => 
    array (
      0 => 'C:\\xampp\\htdocs\\cscart\\design\\backend\\templates\\addons\\vendor_panel_configurator\\hooks\\bottom_panel\\bottom_panel_main.pre.tpl',
      1 => 1728377996,
      2 => 'tygh',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_676d2725ce00e1_17085820 (Smarty_Internal_Template $_smarty_tpl) {
$_smarty_tpl->_checkPlugins(array(0=>array('file'=>'C:\\xampp\\htdocs\\cscart\\app\\functions\\smarty_plugins\\modifier.enum.php','function'=>'smarty_modifier_enum',),));
$_smarty_tpl->_assignInScope('is_demo_mode', (($tmp = $_smarty_tpl->tpl_vars['config']->value['demo_mode'] ?? null)===null||$tmp==='' ? false ?? null : $tmp));
$_smarty_tpl->_assignInScope('show_theme_editor', ((defined('AREA') ? constant('AREA') : null) === smarty_modifier_enum("SiteArea::ADMIN_PANEL") && $_smarty_tpl->tpl_vars['auth']->value['act_as_area'] && $_smarty_tpl->tpl_vars['auth']->value['act_as_area'] === smarty_modifier_enum("UserTypes::VENDOR") || $_smarty_tpl->tpl_vars['is_demo_mode']->value) ,false ,2);?>

<?php if ((defined('ACCOUNT_TYPE') ? constant('ACCOUNT_TYPE') : null) === "vendor") {?>
    <?php if ($_smarty_tpl->tpl_vars['runtime']->value['vendor_panel_style']['logo_dark']) {?>
        <?php $_smarty_tpl->_assignInScope('bottom_panel_open_logo', $_smarty_tpl->tpl_vars['runtime']->value['vendor_panel_style']['logo_dark'] ,false ,2);?>
    <?php }?>
    <?php if ($_smarty_tpl->tpl_vars['runtime']->value['vendor_panel_style']['logo']) {?>
        <?php $_smarty_tpl->_assignInScope('bottom_panel_close_logo', $_smarty_tpl->tpl_vars['runtime']->value['vendor_panel_style']['logo'] ,false ,2);?>
    <?php }
}
}
}
