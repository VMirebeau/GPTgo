// On écoute les message des ContentScripts
chrome.runtime.onMessage.addListener(async request => {
	if(request.Phase){

		switch (request.Phase) {
			case 1: // on demande la sélection au tab actif
			chrome.tabs.query({url: "https://chat.openai.com/chat*"}, tabGPTs => {
				if (tabGPTs.length < 1) { // s'il n'y a pas d'onglet avec chatGPT ouvert
					chrome.tabs.create({ url: "https://chat.openai.com/chat" });
					//console.error('Aucun onglet actif trouvé');
				} else {
					chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
						chrome.tabs.sendMessage(tabs[0].id, request);	// on transmet le "getSelection" à l'onglet actif
					});
				}
			});
				break;
			//case 2: géré directement par le popup.htm
			case 3: // on envoie le prompt à chatGPT
				console.log("on veut envoyer le prompt :", request.Message);
				var [tab] = await chrome.tabs.query({url: "https://chat.openai.com/chat*"}); // on cherche l'ID du tab où tourne ChatGPT
				chrome.tabs.sendMessage(tab.id , request);
				break;
			//case 4: géré directement par le popup.htm
			//	break;
			case -1: // Il y a une erreur sur la page ChatGPT
				console.log("case -1");
				chrome.tabs.query({url: "https://chat.openai.com/chat*"}, tabGPT => {	//on récupère l'id de l'onglet chatgpt
					console.log(tabGPT[0]);
					chrome.tabs.update(tabGPT[0].id, { active: true });	// on le rend actif pour que l'utilisateur voie l'erreur
					chrome.windows.update(tabGPT[0].windowId, {focused: true}, function(window) {
						console.log('La fenêtre a été mise à jour :', window);
					  });
				});
				break;	
		}
	}
})


