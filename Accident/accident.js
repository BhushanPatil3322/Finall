var currentLocation;
// Check if geolocation is supported by the browser
if ('geolocation' in navigator) {
    // Request geolocation permission
    navigator.geolocation.getCurrentPosition(
      // Success callback
      function(position) {
        // Permission granted, load the page normally
        console.log('Geolocation permission granted:', position);
		currentLocation = position;
       
		
      },
      // Error callback
      function(error) {
        // Permission denied, disable the page
        console.error('Geolocation permission denied:', error);
        document.body.innerHTML = '<h1>Geolocation permission denied</h1><p>This page requires access to your location.</p>';

      }
    );
  } else {
    // Geolocation not supported, disable the page
    console.error('Geolocation not supported');
    document.body.innerHTML = '<h1>Geolocation not supported</h1><p>This page requires a browser that supports geolocation.</p>';
  }




////////////////////////////////////////////////////////////////////////////////////////////////////////
$(function() {
    //values pulled from query string
    // $('#model').val("crash-car-detection");
    $('#model').val("car-accident-detection-zaliq");
    $('#version').val("2");
    $('#api_key').val("irWFRqqSXQsYGEXyW5sA");
    setupButtonListeners();
});

 var sendMessage = (message) => {
	var xhttp = new XMLHttpRequest()
	xhttp.onreadystatechange = () => {
	  if(this.readyState == 4 && this.status == 0){
		debugger;
		var responseText = JSON.parse(this.responseText)
		alert('msg sent')
		console.log(responseText)
	  }
	}
	xhttp.open('GET', `http://192.168.31.102:8090/SendSMS?username=sarthak&password=123123&phone=9881346187&message=${message}`, true)
	xhttp.send()
  }
  

var infer = function() {
	// $('#output').html("Uploding...");
	$("#resultContainer").show();
	$('html').scrollTop(100000);

	getSettingsFromForm(function(settings) {
		settings.error = function(xhr) {
			$('#output').html("").append([
				"Error loading response.",
				"",
				"Check your API key, model, version,",
				"and other parameters",
				"then try again."
			].join("\n"));
		};

	
        $.ajax(settings)
        .then(function(response) {
			
            try {
				console.log(response)
				console.log("Class-->"+response.predictions[0].class);
				var accident = response.predictions[0].class;
				var con = response.predictions[0].confidence;
               

				var temp=response.predictions[0]
				console.log("Temp --"+temp)
                console.log(accident); //string
				const string=(accident +"detected")
                console.log("Confidence" + con); //number
                console.log("Prediction" + response.predictions[0]); //number

				if(con>0.80){
					$('#output').html("").append("Accident Detected");
					sendEmail(); 
					// sendMessage("HI");
					// console.log("SMS SENT")
					// $('#output').html("").append("Confidence is "+ con );
				}if(con<0.80){
					$('#output').html("").append("Accident Not Detected");
				}

                var Detection = "";
                if (accident =='accident' && con >= 0.40) {
                    console.log("Accident detected ");
                    Detection = "Great! We've received your response";
                }else if(typeof temp === "undefined"){
					console.log("nppppp");
					Detection="Not";
				const textmsg = 'Accident detected at latitude: ' + currentLocation.coords.latitude + '   longitude: ' + currentLocation.coords.longitude ;
		
		
		
				} 
				else {
                    console.log("not detected");
                    Detection = "Great! We've received your response.";
                }
    
                // $('#output').html("").append(Detection);
                $('html').scrollTop(100000);


            } catch (error) {
                console.log("Error occurred: " + error);
            }
        })
        
        .catch(function(error) {
            console.log("Request failed: " + error);
    


		});
	});
};



function sendEmail( ) {
	Email.send({
	  Host: "smtp.elasticemail.com",
	  Username: "bhushanbpatil3322@gmail.com",
	  Password: "3FBC67DE3AF96E6C74B932F884D5A95D949A",
	  To: "bhushanbpatil3322@gmail.com",
	  From: "bhushanbpatil3322@gmail.com",
	  Subject: "Accident Detected",
	  Body: "An accident has been detected with high confidence at latitude: 18.5153, longitude: 73.8217" 
	}).then(
	  message => alert("Email sent successfully")
	);
  }


var retrieveDefaultValuesFromLocalStorage = function() {
	try {
		var api_key = localStorage.getItem("rf.api_key");
		var model = localStorage.getItem("rf.model");
		var format = localStorage.getItem("rf.format");

		if (api_key) $('#api_key').val(api_key);
		if (model) $('#model').val(model);
		if (format) $('#format').val(format);
	} catch (e) {
		// localStorage disabled
	}

	$('#model').change(function() {
		localStorage.setItem('rf.model', $(this).val());
	});

	$('#api_key').change(function() {
		localStorage.setItem('rf.api_key', $(this).val());
	});

	$('#format').change(function() {
		localStorage.setItem('rf.format', $(this).val());
	});
};

var setupButtonListeners = function() {
	// run inference when the form is submitted
	$('#inputForm').submit(function() {
		infer();
		return false;
	});

	// make the buttons blue when clicked
	// and show the proper "Select file" or "Enter url" state
	$('.bttn').click(function() {
		$(this).parent().find('.bttn').removeClass('active');
		$(this).addClass('active');

		if($('#computerButton').hasClass('active')) {
			$('#fileSelectionContainer').show();
			$('#urlContainer').hide();
		} else {
			$('#fileSelectionContainer').hide();
			$('#urlContainer').show();
		}

		if($('#jsonButton').hasClass('active')) {
			$('#imageOptions').hide();
		} else {
			$('#imageOptions').show();
		}

		return false;
	});

	// wire styled button to hidden file input
	$('#fileMock').click(function() {
		$('#file').click();
	});

	// grab the filename when a file is selected
	$("#file").change(function() {
		var path = $(this).val().replace(/\\/g, "/");
		var parts = path.split("/");
		var filename = parts.pop();
		$('#fileName').val(filename);
	});
};

var getSettingsFromForm = function(cb) {
	var settings = {
		method: "POST",
	};

	var parts = [
		"https://classify.roboflow.com/",
		$('#model').val(),
		"/",
		$('#version').val(),
		"?api_key=" + $('#api_key').val()
	];

	var confidence = $('#confidence').val()/100;
	if(confidence) parts.push("&confidence=" + confidence);


	var method = $('#method .active').attr('data-value');
	if(method == "upload") {
		var file = $('#file').get(0).files && $('#file').get(0).files.item(0);
		if(!file) return alert("Please select a file.");

		getBase64fromFile(file).then(function(base64image) {
			settings.url = parts.join("");
			settings.data = base64image;

			console.log(settings);
			cb(settings);
		});
	} else {
		var url = $('#url').val();
		if(!url) return alert("Please enter an image URL");

		parts.push("&image=" + encodeURIComponent(url));

		settings.url = parts.join("");
		console.log(settings);
		cb(settings);
	}
};

var getBase64fromFile = function(file) {
	return new Promise(function(resolve, reject) {
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function() {
		resizeImage(reader.result).then(function(resizedImage){
			resolve(resizedImage);
		});
    };
		reader.onerror = function(error) {
			reject(error);
		};
	});
};

var resizeImage = function(base64Str) {
	return new Promise(function(resolve, reject) {
		var img = new Image();
		img.src = base64Str;
		img.onload = function(){
			var canvas = document.createElement("canvas");
			var MAX_WIDTH = 1500;
			var MAX_HEIGHT = 1500;
			var width = img.width;
			var height = img.height;
			if (width > height) {
				if (width > MAX_WIDTH) {
					height *= MAX_WIDTH / width;
					width = MAX_WIDTH;
				}
			} else {
				if (height > MAX_HEIGHT) {
					width *= MAX_HEIGHT / height;
					height = MAX_HEIGHT;
				}
			}
			canvas.width = width;
			canvas.height = height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, width, height);
			resolve(canvas.toDataURL('image/jpeg', 1.0));  
		};
	});	
};













////////////////////////////////////////////////////////////////////////////////////////////////////////

// $(function() {
// 	retrieveDefaultValuesFromLocalStorage();
// 	setupButtonListeners();
// });

// var infer = function() {
// 	$('#output').html("Inferring...");
// 	$("#resultContainer").show();
// 	$('html').scrollTop(100000);

// 	getSettingsFromForm(function(settings) {
// 		settings.error = function(xhr) {
// 			$('#output').html("").append([
// 				"Error loading response.",
// 				"",
// 				"Check your API key, model, version,",
// 				"and other parameters",
// 				"then try again."
// 			].join("\n"));
// 		};

// 		$.ajax(settings).then(function(response) {
// 			if(settings.format == "json") {
// 				var pretty = $('<pre>');
// 				var formatted = JSON.stringify(response, null, 4)

// 				pretty.html(formatted);
// 				$('#output').html("").append(pretty);
// 				$('html').scrollTop(100000);
// 			} else {
// 				var arrayBufferView = new Uint8Array(response);
// 				var blob = new Blob([arrayBufferView], {
// 					'type': 'image\/jpeg'
// 				});
// 				var base64image = window.URL.createObjectURL(blob);

// 				var img = $('<img/>');
// 				img.get(0).onload = function() {
// 					$('html').scrollTop(100000);
// 				};
// 				img.attr('src', base64image);
// 				$('#output').html("").append(img);
// 			}
// 		});
// 	});
// };

// var retrieveDefaultValuesFromLocalStorage = function() {
// 	try {
// 		var api_key ="car-accident-detection-zaliq"
// 		var model = "2"
// 		var format = "irWFRqqSXQsYGEXyW5sA"

// 		if (api_key) $('#api_key').val(api_key);
// 		if (model) $('#model').val(model);
// 		if (format) $('#format').val(format);
// 	} catch (e) {
// 		// localStorage disabled
// 	}

// 	$('#model').change(function() {
// 		localStorage.setItem('rf.model', $(this).val());
// 	});

// 	$('#api_key').change(function() {
// 		localStorage.setItem('rf.api_key', $(this).val());
// 	});

// 	$('#format').change(function() {
// 		localStorage.setItem('rf.format', $(this).val());
// 	});
// };

// var setupButtonListeners = function() {
// 	// run inference when the form is submitted
// 	$('#inputForm').submit(function() {
// 		infer();
// 		return false;
// 	});

// 	// make the buttons blue when clicked
// 	// and show the proper "Select file" or "Enter url" state
// 	$('.bttn').click(function() {
// 		$(this).parent().find('.bttn').removeClass('active');
// 		$(this).addClass('active');

// 		if($('#computerButton').hasClass('active')) {
// 			$('#fileSelectionContainer').show();
// 			$('#urlContainer').hide();
// 		} else {
// 			$('#fileSelectionContainer').hide();
// 			$('#urlContainer').show();
// 		}

// 		if($('#jsonButton').hasClass('active')) {
// 			$('#imageOptions').hide();
// 		} else {
// 			$('#imageOptions').show();
// 		}

// 		return false;
// 	});

// 	// wire styled button to hidden file input
// 	$('#fileMock').click(function() {
// 		$('#file').click();
// 	});

// 	// grab the filename when a file is selected
// 	$("#file").change(function() {
// 		var path = $(this).val().replace(/\\/g, "/");
// 		var parts = path.split("/");
// 		var filename = parts.pop();
// 		$('#fileName').val(filename);
// 	});
// };

// var getSettingsFromForm = function(cb) {
// 	var settings = {
// 		method: "POST",
// 	};

// 	var parts = [
// 		"https://detect.roboflow.com/",
// 		$('#model').val(),
// 		"/",
// 		$('#version').val(),
// 		"?api_key=" + $('#api_key').val()
// 	];

// 	var classes = $('#classes').val();
// 	if(classes) parts.push("&classes=" + classes);

// 	var confidence = $('#confidence').val();
// 	if(confidence) parts.push("&confidence=" + confidence);

// 	var overlap = $('#overlap').val();
// 	if(overlap) parts.push("&overlap=" + overlap);

// 	var format = $('#format .active').attr('data-value');
// 	parts.push("&format=" + format);
// 	settings.format = format;

// 	if(format == "image") {
// 		var labels = $('#labels .active').attr('data-value');
// 		if(labels) parts.push("&labels=on");

// 		var stroke = $('#stroke .active').attr('data-value');
// 		if(stroke) parts.push("&stroke=" + stroke);

// 		settings.xhr = function() {
// 			var override = new XMLHttpRequest();
// 			override.responseType = 'arraybuffer';
// 			return override;
// 		}
// 	}

// 	var method = $('#method .active').attr('data-value');
// 	if(method == "upload") {
// 		var file = $('#file').get(0).files && $('#file').get(0).files.item(0);
// 		if(!file) return alert("Please select a file.");

// 		getBase64fromFile(file).then(function(base64image) {
// 			settings.url = parts.join("");
// 			settings.data = base64image;

// 			console.log(settings);
// 			cb(settings);
// 		});
// 	} else {
// 		var url = $('#url').val();
// 		if(!url) return alert("Please enter an image URL");

// 		parts.push("&image=" + encodeURIComponent(url));

// 		settings.url = parts.join("");
// 		console.log(settings);
// 		cb(settings);
// 	}
// };

// var getBase64fromFile = function(file) {
//     return new Promise(function(resolve, reject) {
//         var reader = new FileReader();
//         reader.readAsDataURL(file);
//         reader.onload = function() {
//             resolve(reader.result);
//         };
//         reader.onerror = function(error) {
//             reject(error);
//         };
//     });
// };

// var resizeImage = function(base64Str) {
// 	return new Promise(function(resolve, reject) {
// 		var img = new Image();
// 		img.src = base64Str;
// 		img.onload = function(){
// 			var canvas = document.createElement("canvas");
// 			var MAX_WIDTH = 1500;
// 			var MAX_HEIGHT = 1500;
// 			var width = img.width;
// 			var height = img.height;
// 			if (width > height) {
// 				if (width > MAX_WIDTH) {
// 					height *= MAX_WIDTH / width;
// 					width = MAX_WIDTH;
// 				}
// 			} else {
// 				if (height > MAX_HEIGHT) {
// 					width *= MAX_HEIGHT / height;
// 					height = MAX_HEIGHT;
// 				}
// 			}
// 			canvas.width = width;
// 			canvas.height = height;
// 			var ctx = canvas.getContext('2d');
// 			ctx.drawImage(img, 0, 0, width, height);
// 			resolve(canvas.toDataURL('image/jpeg', 1.0));  
// 		};
    
// 	});	
// };