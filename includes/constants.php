<?php

    /***********************************************************************
     * constants.php
     *
     * SCASi4
     *
     * Global constants.
     **********************************************************************/
	
	//** MYSQL DATABASE ITEMS **//
    define("DATABASE", "scas");
    define("PASSWORD", "pantsonfire");
    define("SERVER", "mysql.hcs.harvard.edu");
    define("USERNAME", "scas");

	//** OTHER CONSTANTS **//
	define("ROOT", "hcs.harvard.edu/~scas/i4/html"); 
	define("AJAX_HASH", "ojjklioi7875gjjht78hhggjy788");
	define("LOCAL_HOST_NAME", "WILLYXIAO-THINK"); 
	define("ON_LOCAL_HOST", LOCAL_HOST_NAME == php_uname("n"))
	
	/*
	define("ROOT", realpath(
					dirname(
						dirname(__FILE__))) . "/html"
			); */
?>
