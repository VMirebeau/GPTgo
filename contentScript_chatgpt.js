function askGPT(texte) {
	if (document.getElementsByTagName("textarea")[0] != null) {
		if (isThinking()) {
			console.log ("ChatGPT n'est pas prêt !");
			return false;
		} else { // on envoie la requête
			console.log(document.getElementsByTagName("textarea")[0]);
			document.getElementsByTagName("textarea")[0].value=texte; //forcer texte
			document.getElementsByClassName("absolute p-1")[0].click(); // valider requête
			return true;
		}
	} else {	// Si il y a une erreur sur la page (pas de zone de texte)
		console.log("On passe par ici");
		chrome.runtime.sendMessage({ // dernière phase, on envoie la réponse finale de chatgpt
			Phase  : -1,
			Message : "Erreur sur la page ChatGPT. Veuillez vous reconnecter."
		});
		return false;
	}
}

function isThinking() { // si chatGPT est en train de réfléchir
    return (document.getElementsByTagName("polygon").length < 1);
}

function renvoyerActuel() {
	let newtext = "";
	var interval = setInterval(function(){
		newtext = document.querySelectorAll(".group.w-full")[document.querySelectorAll(".group.w-full").length -1].innerText;
		chrome.runtime.sendMessage({ // On envoie la réponse temporaire de ChatGPT
			Phase  : 4,
			Message : newtext + "▮"
		});
		if (!(isThinking()))
		{
			clearInterval(interval);
			chrome.runtime.sendMessage({ // dernière phase, on envoie la réponse finale de chatgpt
				Phase  : 5,
				Message : newtext
			})
		}
	}, 200);
}

// On écoute les messages venant du background
chrome.runtime.onMessage.addListener((request) => {
	console.log("on reçoit une requête");
	// On montre le message
	if (request.Phase == 3) { // normalement, ça ne peut être que ça : on a envoyé le prompt, on attend la réponse
		console.log("phase 3");
		if (askGPT(request.Message)) {	// si tout se passe bien quand on envoie la requête
			console.log("Requête envoyée :", request.Message);
			renvoyerActuel();
		} // on demande à GPT en forçant le message
	}
})

