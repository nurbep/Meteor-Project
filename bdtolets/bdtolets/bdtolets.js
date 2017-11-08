
AdvsList = new Mongo.Collection('advs');

if(Meteor.isClient){

    navigator.geolocation.getCurrentPosition(function(position) {
        Session.set('lat', position.coords.latitude);
        Session.set('lon', position.coords.longitude);
    });
  var lat=Session.get('lat');
  var lon=Session.get('lon');


  Template.AdvsList.helpers({
    'user':function(){
      Session.set('userName',Meteor.user().profile.name);
      var user={};
      user.email= Meteor.user().emails[0].address;
      user.name=Meteor.user().profile.name;
      return user;
    },


    'Adv': function(){
      var advs= AdvsList.find({});

      
     var adds=[{}];
      advs.forEach(function(adv) {
    var lat1=Session.get('lat');
       console.log(lat1);
       var lon1=Session.get('lon');
       var lat2=adv.latitude;
       var lon2=adv.longitude;
        console.log(lat2);
        console.log(adv.address);

      var p = 0.017453292519943295;    // Math.PI / 180
      var c = Math.cos;
      var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
     var distance=12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
     adv.distance=distance;
     console.log(adv.distance);
     var ob={distance:adv.distance, address:adv.address,AddTitle:adv.AddTitle,AddDesc:adv.AddDesc,MobileNo:adv.MobileNo,Adv_date:adv.Adv_date,Name:adv.Name};
     adds.push(ob);
     
  });
     



    
    
     //return adds;

    
      return adds;
    }
    
  });




Template.location.helpers({
  lat: function() { return Session.get('lat'); },
  lon: function() { return Session.get('lon'); },
  add:function() { return Session.get('map_data'); },
  distance:function() {
    var lat1=Session.get('lat');
    var lon1=Session.get('lon');
    var lat2=55.7367;
    var lon2= 12.5692;
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

  //add: function() { return Session.get('ad'); }
  
});


Template.map.onRendered(function(){


Meteor.startup(function () {
  // wire up button click
 
    // test for presence of geolocation
    if(navigator && navigator.geolocation) {
      // make the request for the user's position
      navigator.geolocation.getCurrentPosition(geo_success, geo_error);
    } else {
      // use MaxMind IP to location API fallback
      printAddress(geoip_latitude(), geoip_longitude(), true);
    }
  
});
 
 
function geo_success(position) {
  printAddress(position.coords.latitude, position.coords.longitude);
}
 
function geo_error(err) {
  // instead of displaying an error, fall back to MaxMind IP to location library
  printAddress(geoip_latitude(), geoip_longitude(), true);
}
 
// use Google Maps API to reverse geocode our location
function printAddress(latitude, longitude, isMaxMind) {
    // set up the Geocoder object
    var geocoder = new google.maps.Geocoder();
 
    // turn coordinates into an object
    var yourLocation = new google.maps.LatLng(latitude, longitude);
 
    // find out info about our location
    geocoder.geocode({ 'latLng': yourLocation }, function (results, status) {
    if(status == google.maps.GeocoderStatus.OK) {
      if(results[0]) {
        Session.set('map_data',results[0].formatted_address);
        $('#results').fadeOut(function() {
          $(this).html('<p><b>Abracadabra!</b> My guess is:</p><p><em>' + results[0].formatted_address + '</em></p>').fadeIn();
        })
      } else {
        error('Google did not return any results.');
      }
    } else {
      error("Reverse Geocoding failed due to: " + status);
    }
  });
 
  // if we used MaxMind for location, add attribution link
  if(isMaxMind) {
    $('body').append('<p><a href="http://www.maxmind.com" target="_blank">IP to Location Service Provided by MaxMind</a></p>');
  }
}
 
function error(msg) {
  alert(msg);
}

});



Template.addAdvs.events({
    'submit form': function(event){
      event.preventDefault();

      var AddTitle = event.target.Avds_title.value;
       var AddDesc = event.target.Avds_description.value;
        var MobNo = event.target.MobileNo.value;
        
      AdvsList.insert({
          AddTitle: AddTitle,
          AddDesc:AddDesc,
          MobNo:MobNo,
          latitude:Session.get('lat'),
          longitude:Session.get('lon'),
          address:Session.get('map_data'),
          Adv_date:new Date(),
          postedBy:Meteor.userId(),
          Name:Session.get('userName')
      });
    },
     'click .logout': function(event){
        event.preventDefault();
        Meteor.logout();
    }
  });




Template.register.events({
    'submit form': function(event) {
        event.preventDefault();
        var nameVar = event.target.registerName.value;
        var emailVar = event.target.registerEmail.value;
        var passwordVar = event.target.registerPassword.value;

        var options = {
    
    email:emailVar,
    password:passwordVar,
    profile: {
            name: nameVar
        }
};

        Accounts.createUser(options);
    }
});




Template.login.events({
    'submit form': function(event){
        event.preventDefault();
        var emailVar = event.target.loginEmail.value;
        var passwordVar = event.target.loginPassword.value;
        Meteor.loginWithPassword(emailVar, passwordVar);
    }
});





}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
