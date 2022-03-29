<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>USU Weather</title>
	<style>
		html {
			height: 100%;
		}
		
		body {
			font-size: 40px;
			width: 100%;
			height: 100%;
		}
		
		
		#content {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			text-align: center;
			
		}
		
		#temp, #time {
			display: inline;
		}
	</style>
	
	<?php
		$url = "https://campusweather1.uwrl.usu.edu/Charts/Get-HC-main.php?chart=76&units=US";
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$json = curl_exec($ch);
		curl_close($ch);
		$obj = json_decode($json, true);
		//$length = intval($obj->series->5->data->length) - 1;
		$temp = round(end($obj['series'][5]['data'])[1] * 10) / 10;
		$time = end($obj['series'][5]['data'])[0];
		$diff_in_mins = round((Date('U') * 1000 - $time) / 1000 / 60);
		
	
	?>
	
</head>
<body>
	<div id="content">
		The temperature was <?php echo $temp ?> ºF on campus 
		<?php echo $diff_in_mins ?> mins ago
		</div>
</body>
</html>