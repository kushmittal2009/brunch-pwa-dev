window.onload = function () {
	
	if (window["WebSocket"]) {
		ws_connect();
		ws.onclose = function (evt) {
			document.body.innerHTML = '<div style="direction: ltr; position: fixed; top: 0; z-index: 999999; display: block; width: 100%; height: 100%; background: #33266e"><p style="position: relative; top: 40%; display: block; font-size: 32px; font-weight: bold; color: #fff; margin: 0 auto; text-align: center">To use this feature you need to enable the brunch "pwa" option.</p></div>';
		};
	} else {
		document.body.innerHTML = '<div style="direction: ltr; position: fixed; top: 0; z-index: 999999; display: block; width: 100%; height: 100%; background: #33266e"><p style="position: relative; top: 40%; display: block; font-size: 32px; font-weight: bold; color: #fff; margin: 0 auto; text-align: center">To use this feature you need to enable the brunch "pwa" option.</p></div>';
	}

	checkCookie();
	//alert(document.cookie);
	
	window.addEventListener('appinstalled', () => {
  window.location.reload();
});

async function periodicsync() {
  const registration = await navigator.serviceWorker.ready;
  try {
    await registration.periodicSync.register('get-latest-version', {
      minInterval: 12 * 60 * 60 * 1000,
    });
  } catch {
    console.log('Periodic Sync could not be registered!');
    return;
  }
  if (Notification.permission !== "granted") {
        if (await Notification.requestPermission() === "granted") {
		setCookie("notifications", "yes");
		showNotification("Only brunch stable release update notifications are enabled by default. You can add more in the settings tab.");
		return;
	}
            console.log("Notifications disabled by user");
	    setCookie("notifications", "no");
	    await registration.periodicSync.unregister('get-latest-version');
  }
}
	
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/brunch-pwa-dev/sw.js', {scope: '/'}).then(function(reg) {
			console.log('Registration succeeded. Scope is ' + reg.scope);
			periodicsync();
		}).catch(function(error) {
			console.log('Registration failed with ' + error);
		});
	};

	refresh_data = function() {
  		document.getElementById("brunch-version").innerHTML = "<b>Installed Brunch:</b><br>"+getCookie("brunch-version");
		document.getElementById("latest-stable").innerHTML = "<b>Stable Brunch:</b><br>"+getCookie("latest-stable");
		document.getElementById("latest-unstable").innerHTML = "<b>Unstable Brunch:</b><br>"+getCookie("latest-unstable");
		document.getElementById("log").innerHTML = log;
	};
	
	refresh_data();
	
	document.getElementById("form").onsubmit = function () {
		document.getElementById("log").style.background = "gray";
		log = "<br>Console log:<br>";
		document.getElementById("log").innerHTML = log;
		if (!ws) {
			return false;
		}
		ws.send("update-stable");
		return false;
	};

	document.getElementById("form2").onsubmit = function () {
		document.getElementById("log").style.background = "gray";
		log = "<br>Console log:<br>";
		document.getElementById("log").innerHTML = log;
		if (!ws) {
			return false;
		}
		ws.send("update-unstable");
		return false;
	};

	setTimeout(() => { ws.send("brunch-version\nlatest-stable\nlatest-unstable\nchromeos-version\nlatest-chromeos"); }, 2000);
};
