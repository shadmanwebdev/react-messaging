<?php
/**
 * Plugin Name: My React Messenger
 * Version: 1.0.0
 * Author: Your Name
 * Description: A WordPress messenger built with React.
 */

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Your plugin code will go below this line.
function my_react_messenger_shortcode() {
    // Enqueue the plugin's assets.
    wp_enqueue_style( 'my-react-messenger-style', plugin_dir_url( __FILE__ ) . 'assets/static/css/main.abcdef123.css', array(), '1.0.0' );
    wp_enqueue_script( 'my-react-messenger-script', plugin_dir_url( __FILE__ ) . 'assets/static/js/main.316ba1cb.js', array( 'jquery' ), '1.0.0', true );

    // Pass the site_uuid to your React application.
    $site_uuid = get_option( 'my_react_messenger_site_uuid' );
    wp_localize_script( 'my-react-messenger-script', 'my_plugin_data', array(
        'site_uuid' => $site_uuid,
        'ajax_url'  => admin_url( 'admin-ajax.php' ), // If you need AJAX later
    ) );

    // Output the container where your React app will be rendered.
    return '<div id="react-messenger-root"></div>';
}

add_shortcode( 'react_messenger', 'my_react_messenger_shortcode' );






