chrome.runtime.onMessage.addListener((request) => {
	if (request.Phase == 1) // l'onglet popup nous demande quelle est la sélection
	{
		//console.log("On nous a demandé la sélection :", window.getSelection().toString()); // sur certaines pages, cette fonction renvoie une chaîne vide, alors qu'on a bien sélectionné quelque chose. Je ne sais pas pourquoi. Je me demande si ce n'est pas lié à un problème de cache ?
		chrome.runtime.sendMessage({ // on envoie un message au background.js avec la sélection
			Phase  : 2 ,
			Message : window.getSelection().toString()
		});
	}
})