﻿(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'MetaverseService', 'FlashService','localStorageService', '$interval', '$translate', '$window'];

    function LoginController($location, MetaverseService, FlashService, localStorageService, $interval, $translate, $window) {
        var vm = this;

        vm.login = login;

        (function initController() {
            // reset login status
            localStorageService.remove('credentials');
        })();

        vm.changeLang = (key) => $translate.use(key)
            .then(  (key) => localStorageService.set('language',key) )
            .catch( (error) => console.log("Cannot change language.") );

        vm.height = '';

        function updateHeight() {
          MetaverseService.FetchHeight()
          .then( (response) => {
            if (typeof response.success !== 'undefined' && response.success) {
              vm.height = response.data;
            }
          });
        }

        updateHeight();
        $interval( () => updateHeight(), 10000);


        function login() {
            //Show loading
            NProgress.start();
            //Check login data
            MetaverseService.CheckAccount(vm.username, vm.password)
      	        .then( (response) => {
      	            if ( typeof response.success !== 'undefined' && response.success && response.data != undefined) {
                       //Success
                          //Save user login credentials
                          localStorageService.set('credentials', {
                              user: vm.username,
                              password: vm.password
                          });
                          setTimeout(  () => NProgress.done(), 500);
                          //Redirect user to home
                          $location.path('/home');
                      } else {
                          //Show login error message
                          setTimeout( () => NProgress.done(), 1000);
                          $translate('MESSAGES.LOGIN_WRONG_CREDENTIALS').then( (data) => FlashService.Error(data) );
                          $window.scrollTo(0,0);
                      }

      	        })
                .catch( ()=> {
                  setTimeout( () =>  NProgress.done(), 500 );
                  //Show login error message
                  $translate('MESSAGES.GENERAL_CONNECTION_ERROR').then( (data) => FlashService.Error(data) );
                  $window.scrollTo(0,0);
                }
              );
        };
    }
})();
