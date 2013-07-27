<?php
/*******************************
mailer_class.php

By: Willy Xiao
willy@chenxiao.us

Developed for SCAS i4
masmallclaims@gmail.com

To use code, please contact SCAS or
Willy at the above emails. 

August 2013
***********************************/

define("FAKE_EMAIL_FILE", ROOT . "/i4FakeEmails.txt"); 

function fakeMail($to, $subject, $msg, $headers) {
	try {
		$handle = fopen(FAKE_EMAIL_FILE, "a"); 
		fwrite($handle, json_encode(array("to" => $to, "subject" => $subject, 
			"message" => $msg, "headers" => $headers)) . "\n"); 
		fclose($handle);
		return true; 
	} catch (Exception $e) {
		return false; 
	}
}

class Mailer {
	protected $recipients = array(); 
	protected $sender = ""; 
	protected $sbj = ""; 
	protected $msg = ""; 

	public function to($emails) {
		if($this->isValidEmail($emails)) {
			array_push($this->recipients, $emails); 
		} else {
			throw new Exception("'To' field incorrect. Multipls recipients not supported at" . 
				"this time."); 
		}
	}
	
	public function from($email) {
		if($this->isValidEmail($email)) {
			$this->sender = $email; 
		} else {
			return false; 
		}
	}
	
	public function subject($sbj) {
		$this->sbj = $sbj; 
	}
	
	public function message($msg) {
		$this->msg = $msg; 
	}
	
	public function send() {
		if(LOCAL_HOST) {
			return fakeMail($this->recipients, 
				$this->sbj, $this->msg, 
				"From: " . $this->sender); 
		} else {		
			return mail($this->recipients[0], 
				$this->sbj, 
				$this->msg, 
				"From: " . $this->sender); 
		}
	}
	
	public function isValidEmail($email) {
		return filter_var($email, FILTER_VALIDATE_EMAIL); 
	}
}
?>
