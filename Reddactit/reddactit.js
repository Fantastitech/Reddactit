// If not set, set redacted variable to track whether the state of redaction.
if (redacted == null) {
    var redacted = false; 
}

// The OP array will be used to style the OP in places where it can't be detected via the HTML.
if (OP == null) {
    var OP = []; 
}

if (mods == null) {
    var mods = []; 
}


// Create a hash of a string. Usernames will be fed here.
function hashCode(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash;
    }
    return hash;
}

// For converting the hash from hashCode into RGB color values.
// I intend to replace this with something better combining the hashing and hex conversion.
// Credit to: https://stackoverflow.com/a/3426956/6063876
function intToRGB(i) { 
    var c = (i & 0x00FFFFFF) //
    .toString(16)
    .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

// Allows us to see if any parent of an element contains a class.
// Used for determining that the top username is the OP.
function hasSomeParentTheClass(element, classname) {
    if (!element.parentNode)
        return false;
    if (element.className.split(" ").indexOf(classname) >= 0)
        return true;
    return hasSomeParentTheClass(element.parentNode, classname);
}

function getUserID(element) {
    const classes = element.classList;
    const userId = Array.from(classes)
            .find((className) =>  /^id-t2_[a-z0-9]+$/.test(className));
     // .find will return the first class name which matches the regex, or undefined if none
    return userId;
}

function addStyle(element) {
	var userName = element.innerHTML.split("u/").pop().toLowerCase(); // Get username from mention and remove "/u/"
	var color = "#" + intToRGB(hashCode(userName));
	element.style.setProperty("transition", "all 0.15s ease")
    element.style.setProperty("color", "rgba(0, 0, 0, 0)", "important") // Make username transparent.
    element.style.setProperty("background-color", color, "important") // Add color from hash to background.
	if ((OP.indexOf(userName) > -1) && !(element.classList.contains("moderator"))) { // If user has been set as an OP in redactUsernames(), add OP style.
		element.style.setProperty("box-shadow", "inset 0 0 0 2px #0055DF", "important")
		element.style.setProperty("border-radius", "3px", "important")
		element.style.setProperty("outline", "1px solid black", "important")
		element.style.setProperty("outline-offset", "-3px", "important")
	}
	if (mods.indexOf(userName) > -1) { // Add additional styling to the OP's username.
		element.style.setProperty("box-shadow", "inset 0 0 0 2px #228822", "important")
		element.style.setProperty("border-radius", "3px", "important")
		element.style.setProperty("outline", "1px solid black", "important") // Add a black barrier between the outline to make it more distinct when colors clash.
		element.style.setProperty("outline-offset", "-3px", "important")
    }
}

function removeStyle(element) {
	var userName = element.innerHTML.split("u/").pop().toLowerCase(); // Get username.
	element.style.removeProperty("color"); // Remove all styles including OP flair.
	element.style.removeProperty("background-color");
	if ((OP.indexOf(userName) > -1) || (mods.indexOf(userName) > -1)) {
		element.style.removeProperty("box-shadow")
		element.style.removeProperty("border-radius")
		element.style.removeProperty("outline")
		element.style.removeProperty("outline-offset")
	}
}

function redactMatchingUsernames(e) {
	var x = document.getElementsByTagName("a");
	var sourceUserName = e.innerHTML.split("u/").pop().toLowerCase();
	Array.from(x).forEach(function(i) {
		if (i.getAttribute("redacted") == "false") {
			var destUserName = i.innerHTML.split("u/").pop().toLowerCase();
			if (sourceUserName == destUserName) {
				addStyle(i);
				i.setAttribute("redacted", "true");
			}
		}
	});
}

function restoreMatchingUsernames(e) {
	var x = document.getElementsByTagName("a");
	var sourceUserName = e.innerHTML.split("u/").pop().toLowerCase();
	Array.from(x).forEach(function(i) {
		if (i.getAttribute("redacted") == "true") {
			var destUserName = i.innerHTML.split("u/").pop().toLowerCase();
			if (sourceUserName == destUserName) {
				removeStyle(i)
				i.setAttribute("redacted", "false");
			}
		}
	});
}

// Process usernames that are part of the reddit style.
function redactAllUsernames() {
    var x = document.getElementsByClassName("author"); // Get all elements with class "author".
    Array.from(x).forEach(function(i) {
		if (i.classList.contains("admin")) { // Skip admins
			return
        }
        var userName = i.innerHTML.toLowerCase() // Usernames must be converted to lowercase for consistency of hashes with username mentions that use incorrect case.		
        if ((i.classList.contains("submitter") || hasSomeParentTheClass(i, "top-matter")) && !(i.classList.contains("moderator") || i.classList.contains("admin"))) { // Add additional styling to the OP's username.
			OP.push(userName); // If user is OP, add username to OP array so we can make styling consistent for username mentions.
        }
		if ((i.classList.contains("moderator")) && !(i.classList.contains("admin"))) { // Add additional styling to the OP's username.
			mods.push(userName);
        }
		addStyle(i)
		i.setAttribute("redacted", "true"); // Mark elements as having been modified by the script.
    });
}

// Process usernames mentioned in the body of comments using "*u/".
function redactAllMentions() {
	var x = document.getElementsByTagName("a"); // Get all <a> elements.
    Array.from(x).forEach(function(i) {
		if (/\/u\/[a-zA-Z0-9-_]{3,30}$/.test(i.href)) { // Regex to find username mentions: "*/u/" followed by 3-30 alphanumeric characters plus - and _
			addStyle(i)
			i.setAttribute("redacted", "true"); // Mark elements as having been modified by the script.
		}
	});
}

// Remove all styles set by the redaction functions
function restoreAllUsernames() {
    var x = document.getElementsByTagName("a"); // Get all <a> elements.
    Array.from(x).forEach(function(i) {
		if (i.hasAttribute("redacted")) { // Find elements we previously marked with the "redacted" attribute.
			removeStyle(i)
			i.removeAttribute("redacted");
		}
    });
	OP.length = 0;
	mods.length = 0;
}

function addUsernameClickCapture() {
	document.documentElement.onclick = function(event) {
		if (event.target.hasAttribute("redacted")) {
			event.preventDefault();
			if ((event.target.getAttribute("redacted")) == "true") {
				restoreMatchingUsernames(event.target);
			} else {
				redactMatchingUsernames(event.target);
			}
		}
	}
	document.documentElement.onmouseover = function(event) {
		if (event.target.getAttribute("redacted", "true") == "true") {
			//removeStyle(event.target)
			event.target.style.removeProperty("box-shadow")
			event.target.style.removeProperty("outline")
			event.target.style.removeProperty("outline-offset")
			event.target.style.removeProperty("color") // Make username transparent.
			event.target.style.setProperty("background-color", "lightgrey")
		}
	}
	document.documentElement.onmouseout = function(event) {
		if (event.target.getAttribute("redacted") == "true") {
			addStyle(event.target)
		} else if (event.target.getAttribute("redacted") == "false") {
			removeStyle(event.target)
		}
	}	
}

function run() {
    if (redacted == false) {
		addUsernameClickCapture();
        redactAllUsernames(); // Redact usernames, mentions, and set redacted variable to true.
		redactAllMentions();
		redacted = true;
    } else if (redacted == true) {
        restoreAllUsernames(); // Remove all styling done by redaction functions and set redacted variable to false.
		document.documentElement.onclick = "";
		redacted = false;
    }
}

run()
