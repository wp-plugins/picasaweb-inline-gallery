<?php
/*
Plugin Name: Picasaweb inline gallery
Version: 1.0
Plugin URI: http://bondariev.info/web/picasaweb/
Description: Small jQuery based plugin for processing external web galleries inline on page
Author: Eugene Bond
Author URI: http://bondariev.info/
*/ 

// We need include some CSS and JS into head block
function picasaweb_head() {
	echo '
	<style type="text/css">
	@import url('.get_bloginfo('wpurl').'/wp-content/plugins/picasaweb/styles.css);
	</style>
	';
	if (!get_option('picasaweb_skip_jq')) {
		echo '
	<script src="'.get_bloginfo('wpurl').'/wp-content/plugins/picasaweb/jquery.js"></script>';
	}
	echo '
	<script src="'.get_bloginfo('wpurl').'/wp-content/plugins/picasaweb/jquery.picasaweb.js"></script>';
}

function picasaweb_footer() {
	echo '
	<script>$.picasaweb.init("'.get_option('picasaweb_init_rule').'");</script>';
}
add_action('wp_head', 'picasaweb_head');
add_action('wp_footer', 'picasaweb_footer');

add_option('picasaweb_skip_jq', '0', 'Picasaweb Plugin. Flag to skip adding jquery.js code on page', false);
add_option('picasaweb_init_rule', 'a', 'Picasaweb Plugin. CSS-based rule to all page elements should be processed', false);




function picasaweb_config_page() {
	if ( function_exists('add_submenu_page') )
		add_submenu_page('options-general.php', __('Picasaweb Configuration'), __('Picasaweb Configuration'), 'manage_options', 'picasaweb-config', 'picasaweb_conf');
}
add_action('admin_menu', 'picasaweb_config_page');

function picasaweb_conf() {
	if ( isset($_POST['submit']) ) {
		if ( function_exists('current_user_can') && !current_user_can('manage_options') )
			die(__('Cheatin&#8217; uh?'));
	
		update_option('picasaweb_skip_jq', (int) $_POST['picasaweb']['skip_js']);
		if ($a = trim($_POST['picasaweb']['init_rule'])) {
			update_option('picasaweb_init_rule', $a);
		}
		
		echo '<div id="message" class="updated fade"><p><strong>'._e('Options saved.').'</strong></p></div>';
	}
?>
<div class="wrap">
<h2><?php _e('Picasaweb Inline Gallery Configuration'); ?></h2>
<div>
<form action="" method="post" id="picasaweb-conf" style="margin: auto; width: 650px; ">
<p><label><input name="picasaweb[skip_jq]" id="picasaweb_skip_jq" value="1" type="checkbox" <?php if ( get_option('picasaweb_skip_jq') == 1 ) echo ' checked="checked" '; ?> /> <?php _e('Skip adding jQuery core library (Use it if you already have jQuery loaded by any other plugin)'); ?></label></p>
<p><input id="picasaweb_init_rule" name="picasaweb[init_rule]" type="text" size="24" maxlength="128" value="<?php echo get_option('picasaweb_init_rule'); ?>" style="font-family: 'Courier New', Courier, mono; font-size: 1.5em;" /> <?php _e('<a href="http://docs.jquery.com/Selectors">jQuery selector</a> to processing elements.'); ?></p>
	<p class="submit"><input type="submit" name="submit" value="<?php _e('Update options &raquo;'); ?>" /></p>
</form>
</div>
</div>
<?php
}