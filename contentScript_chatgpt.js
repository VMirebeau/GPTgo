const DISPO = 0;
const OCCUPE = 1;
var etatGPT = DISPO;

function askGPT(texte) {
	if (isThinking()) {
		console.log ("ChatGPT n'est pas prêt !");
	} else { // on envoie la requête
		document.getElementsByTagName("textarea")[0].value=texte; //forcer texte
		document.getElementsByClassName("absolute p-1")[0].click(); // valider requête
	}
}

function isThinking() { // si chatGPT est en train de réfléchir
    return (document.getElementsByTagName("polygon").length < 1);
}


// On écoute les messages venant du background
chrome.runtime.onMessage.addListener((request) => {
	console.log("on reçoit une requête");
	// On montre le message
	if (request.Phase == 3) { // normalement, ça ne peut être que ça : on a envoyé le prompt, on attend la réponse
		console.log("phase 3");
		askGPT(request.Message); // on demander à GPT en forçant le message
		console.log("Requête envoyée :", request.Message);

		// On envoie le message vers le background script
		document.getElementsByClassName("absolute p-1")[0].addEventListener('DOMSubtreeModified', () => {
			if (etatGPT == DISPO) {
				if (isThinking()) { //console.log ("On commence à réfléchir")
					etatGPT = OCCUPE;
					//dessinerCercle("orange");
				}
			} else if (etatGPT == OCCUPE) {
				if (!(isThinking())) {
					etatGPT = DISPO;
					//dessinerCercle("green");
					var reponse = document.querySelectorAll(".group.w-full")[document.querySelectorAll(".group.w-full").length -1].innerText;
					console.log (reponse);
					chrome.runtime.sendMessage({ // dernière phase, on envoie la réponse finale de chatgpt
						Phase  : 4,
						Message : reponse
					})
				}
			}
		});
	}


})

