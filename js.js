// Tim's Mass Protection Tool
// Adapted from [[User:Animum/massdelete.js]]

function doMassProtect() {
    document.getElementById("wpMassProtectSubmit").disabled = true;
    var articles = document.getElementById("wpMassProtectPages").value.split("\n");
    if(articles.length == 0) return;
    var text = document.getElementById("wpMassProtectText1").value;
    var wpEditProtectType = document.getElementById("wpEditProtectType").value,
    wpMassProtectSummary = document.getElementById("wpMassProtectSummary").value,
    wpCreateProtectType = document.getElementById("wpCreateProtectType").value,
    wpMoveProtectType = document.getElementById("wpMoveProtectType").value,
    done = 0, failed = new Array(), error = new Array(),
    wpMassProtectExpiry = document.getElementById("wpMassProtectExpiry").value;
    
    var protectionstring = "protections=", expirystring = "expiry=";
    if(wpEditProtectType != "nochange"){
        protectionstring += "edit=" + wpEditProtectType;
        expirystring += encodeURIComponent(wpMassProtectExpiry) + "|";
    }
    if(wpCreateProtectType != "nochange"){
        protectionstring += "create=" + wpCreateProtectType;
        expirystring += encodeURIComponent(wpMassProtectExpiry) + "|";
    }
    if(wpCreateProtectType != "nochange"){
        protectionstring += "move=" + wpCreateProtectType;
        expirystring += encodeURIComponent(wpMassProtectExpiry) + "|";
    }
    if(protectionstring == "protections=") return;
    
    expirystring = expirystring.replace(/\|$/, ''); // remove trailing pipe.    
    
    for(i=0;i<articles.length;i++) {
        var article = articles[i];
        if(article.length > 0) {
            var req = new XMLHttpRequest();
            req.open("GET", mw.config.get('wgScriptPath') + "/api.php?format=json&action=query&prop=info&meta=tokens&type=csrf&titles=" + encodeURIComponent(article), false);
            req.send(null);
            var query = eval("(" + req.responseText + ")").query;
            var token = query.tokens.csrftoken;
            var response = query.pages;
            for(var index in response) {
                var info = response[index];
                var postdata = "format=json"
                             + "&action=protect"
                             + "&title=" + encodeURIComponent(article)
                             + "&" + protectionstring
                             + "&" + expirystring
                             + "&reason=" + wpMassProtectSummary
                             + "&token=" + encodeURIComponent(token);
                var req = new XMLHttpRequest();
                req.open("POST", mw.config.get('wgScriptPath') + "/api.php", false);
                req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                req.setRequestHeader("Content-length", postdata.length);
                req.send(postdata);
                if(eval("(" + req.responseText + ")").protect ) { //If protection successful, add a tag (if page exists), update the count and the button.
                    if(text != ""){
                        var postdata = "format=json"
                                     + "&action=edit&nocreate=1"
                                     + "&title=" + encodeURIComponent(article)
                                     + "&prependtext=" + encodeURIComponent(text + "\n")
                                     + "&summary=" + encodeURIComponent(text)
                                     + "&token=" + encodeURIComponent(token);
                        var req = new XMLHttpRequest();
                        req.open("POST", mw.config.get('wgScriptPath') + "/api.php", false);
                        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        req.setRequestHeader("Content-length", postdata.length);
                        req.send(postdata);
                    }
                    done++;
                    document.getElementById("wpMassProtectSubmit").value = "(" + done + ")";
                } else { //If not edited, add the title to the "failed" array and a description of the error to the "error" array.
                    failed.push(article);
                    error.push(eval("(" + req.responseText + ")").error.info);
                }
            }
        }
        if(!articles[i+1]) {
            document.getElementById("wpMassProtectSubmit").value = "Done (" + edited + ")";
            if(failed.length > 0) {
                var linkedList = "";
                for(x=0; x<failed.length; x++) {
                    linkedList += "<li><a href=\"" + mw.config.get('wgScript') + "?title=" + encodeURIComponent(failed[x]) + "\">" + failed[x] + "</a>: " + error[x] + "</li>"; //Links the titles in the "failed" array
                }
                document.getElementById("wpMassProtectFailedContainer").innerHTML += '<br /><b>Failed edits:</b><ul>' + linkedList + '</ul>';
            }
            
        }
    }
}

function gettext(title){
    var req = new XMLHttpRequest();
    req.open("GET", mw.config.get('wgScriptPath') + "/api.php?action=query&prop=revisions&rvprop=content&format=json&indexpageids=1&titles="+encodeURIComponent(title), false);
    req.send(null);
    var response = eval('(' + req.responseText + ')');
    pageid = response['query']['pageids'][0];
    if (pageid == "-1") {
        delete req;
        return '';
    }
    var pagetext = response['query']['pages'][pageid]['revisions'][0]['*'];
    return pagetext;
} 
function massprotectform() {
    var bodyContent;
	switch (mw.config.get('skin')) {
		case 'modern':
			bodyContent = 'mw_contentholder';
			break;
		case 'cologneblue':
			bodyContent = 'article';
			break;
		case 'monobook':
		case 'vector':
		default:
			bodyContent = 'bodyContent';
			break;
	}
    document.getElementsByTagName("h1")[0].textContent = "Tim's mass protection tool";
    document.title = "Tim's mass-editing tool - Wikipedia, the free encyclopedia";
    document.getElementById(bodyContent).innerHTML = '<h3 id="siteSub">From Wikipedia, the free encyclopedia</h3><br /><br />'
        + '<form id="wpMassProtect" name="wpMassProtect">'
        + '<b>If you abuse this tool, it\'s <i>your</i> fault, not mine.</b>'
        + '<div id="wpMassProtectFailedContainer"></div>'
        + '<br /><br />'
            + 'Pages to protect (one on each line, please):<br />'
                + '<textarea tabindex="1" name="wpMassProtectPages" id="wpMassProtectPages" rows="10" cols="80"></textarea>'
            + 'Protection tag to add to protected page (optional):<br />'
                + '<textarea tabindex="2" name="wpMassProtectText1" id="wpMassProtectText1" rows="10" cols="80"></textarea>'
            + '<br /><br /><table style="background-color:transparent">'
                + '<tr><td>Edit protection type:</td>'
                    + '<td><select id="wpEditProtectType">'
                        + '<option value="nochange">No change</option>'
                        + '<option value="all">Unprotect</option>'
                        + '<option value="autoconfirmed">Semi</option>'
                        + '<option value="sysop">Full</option>'
                    + '</select></td></tr>'
                + '<tr><td>Create protection type:</td>'
                    + '<td><select id="wpCreateProtectType">'
                        + '<option value="nochange">No change</option>'
                        + '<option value="all">Unprotect</option>'
                        + '<option value="autoconfirmed">Semi</option>'
                        + '<option value="sysop">Full</option>'
                    + '</select></td></tr>'
                + '<tr><td>Move protection type:</td>'
                    + '<td><select id="wpMoveProtectType">'
                        + '<option value="nochange">No change</option>'
                        + '<option value="all">Unprotect</option>'
                        + '<option value="autoconfirmed">Semi</option>'
                        + '<option value="sysop">Full</option>'
                    + '</select></td></tr>'
            + '<tr><td>Reason:</td>'
                + '<td><input type="text" id="wpMassProtectSummary" name="wpMassProtectSummary" maxlength="255" /></td></tr>'
            + '<tr><td>Expiry:</td>'
                + '<td><input type="text" id="wpMassProtectExpiry" name="wpMassProtectExpiry" maxlength="255" /></td></tr>'
                + '<tr><td><input type="button" id="wpMassProtectSubmit" name="wpMassProtectSubmit" value="Edit" onclick="doMassProtect()" /></td></tr></table>'
        + '</form>';
}
 
if(mw.config.get("wgNamespaceNumber") == -1 && mw.config.get("wgTitle").toLowerCase() == "massprotect" && /sysop/.test(mw.config.get("wgUserGroups"))) $(massprotectform);
