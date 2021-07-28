// Method to just generate a random session key
function randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

// As the name implies, this creates and edits any cookie that a user obtains. It takes in the user's unique key, number of website visits and the number of cookie expiration days (+ a boolean if the page has been reloaded).
// The user type can be "New" or "Frequent" or "Returning"
// The number of website returns is the amount of times a user has visited the website, just a small individual metric that can be built upon later.
// Expiry days is the number of days in which the cookie should expire
// Note that HttpOnly or Secure attributes are not necessary as the cookie stores no personal information, just very generic, non-unique info.
function setCookie(unique_key, noofreturns, expirydays, isreloaded) {
    const d = new Date();
    let lastV = d.toUTCString();
    d.setTime(d.getTime() + (expirydays*24*60*60*1000));
    let expiry = "expires="+ d.toUTCString();
    document.cookie = "miTermsData=" + "session_key=" + unique_key + "|noof_visits=" + noofreturns + "|last_visited=" + lastV + "|has_reloaded=" + isreloaded + ";" + expiry;
}



// Method that gets a specific data value of the cookie.
// Can be used to get the user_type or expiry_days or any other data stored inside the cookie.
// Different data is partitioned by | and NOT ;, which creates a new cookie. All data is stored inside one singular cookie for now
function getCookie(cname) {
let name = cname + "=";
let decodedCookie = decodeURIComponent(document.cookie);
let ca = decodedCookie.split('|');
for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
    c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
    return c.substring(name.length, c.length);
    }
}
return "";
}

// Method to start intercom, literally taken from intercom itself but has been un-anonymised 
function startIntercom()
{
    var w=window;
    var ic=w.Intercom;
    if(typeof ic==="function")
    {
        ic('reattach_activator');
        ic('update',w.intercomSettings);
    }
    else
    {
        var d=document;
        var i=function(){i.c(arguments);};
        i.q=[];
        i.c=function(args){i.q.push(args);};
        w.Intercom=i;
        var l=function(){var s=d.createElement('script');
        s.type='text/javascript';
        s.async=true;
        s.src='https://widget.intercom.io/widget/wsy9k644';
        var x=d.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s,x);};
        if(w.attachEvent)
        {
            w.attachEvent('onload',l);
        } else{
            w.addEventListener('load',l,false);
        }
    }
}

// Immediate executed function.
// This is the main method of this script
// Now, it can track reloads and create new session keys with an identifier to the user type in the key's prefix
// Prefixes are: N, F, R followed by an underscore
// These represent a New, Frequent or Returning user. 
// This may not seem that useful but it allows for better intercom experiences as intercom can now trigger on any reload or new session, even is the conversation is closed before.
// This is done through the unique session key creation, which allows intercom to internally treat them as new traffic but with different (prefixed) parameters.
// TLDR: Unique session key = unique (but not personal or identifiable) User ID
(function() {
    console.log('Main executing');
    var reload = (performance.navigation.type == performance.navigation.TYPE_RELOAD);
    const expirationDays = 30;
    if (decodeURIComponent(document.cookie) == ""){
        var newUserKey = "N_" + randomString(16);
        setCookie(newUserKey, 1, expirationDays, reload, );
        window.intercomSettings = {
            app_id: "wsy9k644",
            user_id: newUserKey,
            custom_launcher_selector:'#custom_intercom'
        };
    } else {
        console.log("Familiar visitor detected");
        let numberofVisits = parseInt(getCookie("noof_visits"));
        var userKey = ((numberofVisits > 15) ? "F" : "R") + "_" + randomString(16);
        setCookie(userKey, numberofVisits + 1, expirationDays, reload);
        window.intercomSettings = {
            app_id: "wsy9k644",
            name: "<%= current_user.name %>",
            email: "<%= current_user.email %>",
            user_id: userKey,
            created_at: "<%= current_user.created_at.to_i %>",
            custom_launcher_selector:'#custom_intercom'
        };       
    }
    startIntercom();
}());
