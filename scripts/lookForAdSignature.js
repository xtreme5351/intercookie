function lookForAdvertSig() {
  var delay = 1000;
  var adSignature = 'hsa_acc=3141869095';
  var regularArrival = 'arrived_home';
  var adArrival = 'arrived_home_from_ad';
  setTimeout(function() {
    if(window.location.href.toString().includes(adSignature)){
     Intercom('trackEvent', adArrival); 
    } else {
      Intercom('trackEvent', regularArrival);
    }
  }, delay);
}

// Add this method to the rest of the script if the ad signature code looker is destroyed.
// It is probably better to integrate this, but this integration is up for review.

// When adding, don't forget to call this after the StartIntercom() method call in the main method.
