<?php
/* Smarty version 4.3.0, created on 2024-12-26 01:51:51
  from 'C:\xampp\htdocs\cscart\design\backend\templates\addons\onboarding_guide\steps\customize_vendor_panel_design.tpl' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '4.3.0',
  'unifunc' => 'content_676d2737f0de12_28584100',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'd1e7f84f20730b40f22f0cd4cb3aa000b3cd8567' => 
    array (
      0 => 'C:\\xampp\\htdocs\\cscart\\design\\backend\\templates\\addons\\onboarding_guide\\steps\\customize_vendor_panel_design.tpl',
      1 => 1728377995,
      2 => 'tygh',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_676d2737f0de12_28584100 (Smarty_Internal_Template $_smarty_tpl) {
\Tygh\Languages\Helper::preloadLangVars(array('onboarding_guide.edit_vendor_panel_style','onboarding_guide.edit_colors','onboarding_guide.edit_structure'));
?>
<div class="onboarding_content_margin--bottom">
    <span class="onboarding_section__progress_text"><?php echo $_smarty_tpl->__("onboarding_guide.edit_vendor_panel_style");?>
</span>
</div>

<div class="onboarding_section__action_block onboarding_content_margin--bottom">
    <a href="<?php ob_start();
echo htmlspecialchars((string) urlencode("customization.update_mode&?type=theme_editor&status=enable&return_url=index"), ENT_QUOTES, 'UTF-8');
$_prefixVariable3=ob_get_clean();
echo htmlspecialchars((string) fn_url("onboarding_guide.open_vendor_panel?redirect=".$_prefixVariable3), ENT_QUOTES, 'UTF-8');?>
" class="og-action btn btn-primary" data-og-action="edit_style" target="_blank"><?php echo $_smarty_tpl->__("onboarding_guide.edit_colors");?>
 ↗</a>
    <a href="<?php ob_start();
echo htmlspecialchars((string) urlencode("customization.update_mode&?type=block_manager&status=enable&return_url=index"), ENT_QUOTES, 'UTF-8');
$_prefixVariable4=ob_get_clean();
echo htmlspecialchars((string) fn_url("onboarding_guide.open_vendor_panel?redirect=".$_prefixVariable4), ENT_QUOTES, 'UTF-8');?>
" class="og-action btn" data-og-action="edit_structure" target="_blank"><?php echo $_smarty_tpl->__("onboarding_guide.edit_structure");?>
 ↗</a>
</div><?php }
}
