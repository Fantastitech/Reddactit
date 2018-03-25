// If not set, set redacted variable to track whether the state of redaction.
if (redacted == null) {
    var redacted = false; 
}

// The OP array will be used to style the OP in places where it can't be detected via the HTML.
if (OP == null) {
    var OP = []; 
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

// Process usernames that are part of the reddit style.
function redactUsernames() {
    var x = document.getElementsByClassName("author"); // Get all elements with class "author".
    var i;
    for (i = 0; i < x.length; i++) {
        var userName = x[i].innerHTML.toLowerCase() // Usernames must be converted to lowercase for consistency of hashes with username mentions that use incorrect case.
	var color = "#" + intToRGB(hashCode(userName)); // Get color from username string.
	x[i].style.setProperty("transition", "all 0.15s ease")
        x[i].style.setProperty("color", "rgba(0, 0, 0, 0)", "important") // Make username transparent.
        x[i].style.setProperty("background-color", color, "important") // Add color from hash to background.
        if (x[i].classList.contains("submitter") || hasSomeParentTheClass(x[i], "top-matter")) { // Add additional styling to the OP's username.
	    OP.push(userName); // If user is OP, add username to OP array so we can make styling consistent for username mentions.
            x[i].style.setProperty("box-shadow", "inset 0 0 0 2px blue", "important")
            x[i].style.setProperty("border-radius", "3px", "important")
            x[i].style.setProperty("outline", "1px solid black", "important") // Add a black barrier between the outline to make it more distinct when colors clash.
            x[i].style.setProperty("outline-offset", "-3px", "important")
        }
	x[i].setAttribute("redacted",""); // Mark elements as having been modified by the script.
    }
}

// Process usernames mentioned in the body of comments using "*u/".
function redactMentions() {
	var x = document.getElementsByTagName("a"); // Get all <a> elements.
    var i;
    for (i = 0; i < x.length; i++) {
		if (/\/u\/[a-zA-Z0-9-_]{3,30}$/.test(x[i].href)) { // Regex to find username mentions: "*/u/" followed by 3-30 alphanumeric characters plus - and _
			var userName = x[i].innerHTML.split("u/").pop().toLowerCase(); // Get username from mention and remove "/u/"
			var color = "#" + intToRGB(hashCode(userName)); // Get color from username.
			x[i].style.setProperty("transition", "all 0.15s ease")
			x[i].style.setProperty("color", "rgba(0, 0, 0, 0)", "important") // Style same as before.
			x[i].style.setProperty("background-color", color, "important")
			if (OP.indexOf(userName) > -1) { // If user has been set as an OP in redactUsernames(), add OP style.
				x[i].style.setProperty("box-shadow", "inset 0 0 0 2px blue", "important")
				x[i].style.setProperty("border-radius", "3px", "important")
				x[i].style.setProperty("outline", "1px solid black", "important")
				x[i].style.setProperty("outline-offset", "-3px", "important")
			}
			x[i].setAttribute("redacted",""); // Mark elements as having been modified by the script.
		}
	}
}

// Remove all styles set by the redaction functions
function restoreUsernames() {
    var x = document.getElementsByTagName("a"); // Get all <a> elements.
    var i;
    for (i = 0; i < x.length; i++) {
		if (x[i].hasAttribute("redacted")) { // Find elements we previously marked with the "redacted" attribute.
			var userName = x[i].innerHTML.split("u/").pop().toLowerCase(); // Get username.
			x[i].style.removeProperty("color"); // Remove all styles including OP flair.
			x[i].style.removeProperty("background-color");
			if (OP.indexOf(userName) > -1) {
				x[i].style.removeProperty("box-shadow")
				x[i].style.removeProperty("border-radius")
				x[i].style.removeProperty("outline")
				x[i].style.removeProperty("outline-offset")
			}
			x[i].removeAttribute("redacted");
		}
    }
	OP.length = 0;
}

function run() {
    if (redacted == false) {
        redactUsernames(); // Redact usernames, mentions, and set redacted variable to true.
		redactMentions();
		redacted = true
    } else if (redacted == true) {
        restoreUsernames(); // Remove all styling done by redaction functions and set redacted variable to false.
		redacted = false
    }
}

run()
