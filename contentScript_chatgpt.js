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


async function verifierNoeud () {
	var nextDiv = null;
	while (nextDiv == null) // on attend que le div qui contient la réponse soit prêt
	{
		var allBlanc = document.querySelectorAll("div.dark\\:bg-gray-800.group"); // on sélectionne l'ensemble des div qui contiennent les prompts
		var dernierPrompt = allBlanc[allBlanc.length - 1]; // on prend le dernier prompt
		if (dernierPrompt == null) {	// s'il n'est pas encore inscrit dans le DOM, on attend (cas du tout premier prompt)
			nextDiv = null;
		} else {
			var nextDiv = dernierPrompt.nextElementSibling;	// s'il existe, on prend le div qui suit (qui va contenir la réponse de chatGPT)
		}
		await new Promise (resolve => setTimeout (resolve, 100)); // attendre 100 millisecondes } // appeler l’observateur de mutation
	}
	let callback = function(mutations) {	// fonction exécutée quand on détecte un changement dans la réponse qui est en train d'être produite
			newtext = (document.querySelectorAll(".group.w-full")[document.querySelectorAll(".group.w-full").length -1].innerText);
			// ON VA TESTER LA FIN DU MESSAGE
			var el = document.querySelectorAll(".group.w-full p:last-of-type")[document.querySelectorAll(".group.w-full  p:last-of-type").length -1]; // sélectionner l’élément
			var after = getComputedStyle (el, "::after").content; // obtenir le contenu du pseudo-élément ::after
			//console.log ("On traite une modification : ", mutations)
			if (after !== "none") { // si on n'a pas terminé
				chrome.runtime.sendMessage({ // On envoie la réponse temporaire de ChatGPT
					Phase  : 4,
					Message : newtext
				});
			} else {		// si on a terminé
				observer.disconnect();
				observer = null;
				console.log("déconnecté");
				chrome.runtime.sendMessage({ // dernière phase, on envoie la réponse finale de chatgpt
					Phase  : 5,
					Message : newtext
				})
			}
		};

		// Créer un observateur avec la fonction de rappel
		let observer = new MutationObserver(callback);

		// Définir la configuration de l'observateur : observer les changements de caractères du div
		let config = {characterData: true, subtree: true, attributes:true};
		console.log(document.querySelectorAll(".group.w-full")[document.querySelectorAll(".group.w-full").length -1]);

		observer.observe(document.querySelectorAll(".group.w-full")[document.querySelectorAll(".group.w-full").length -1], config);

}

// On écoute les messages venant du background
chrome.runtime.onMessage.addListener((request) => {
	console.log("on reçoit une requête", request);
	// On montre le message
	
	switch (request.Phase) {
		case 3 :  // on a envoyé le prompt, on attend la réponse
			console.log("phase 3");
			if (askGPT(request.Message)) {	// si tout se passe bien quand on envoie la requête
				console.log("Requête envoyée :", request.Message);
				verifierNoeud ();
			}
			break;
		case -2 : // on veut arrêter
			var currentBouton = document.querySelector("button.btn.relative.btn-neutral.border-0.md\\:border");
			if (currentBouton != null)
			{
				if (currentBouton.textContent == "Stop generating")
				{
					currentBouton.click();
				}
			}
			break;
	}
});

