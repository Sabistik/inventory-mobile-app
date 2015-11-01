angular.module('inventory.controllers', [])

        .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

            // With the new view caching in Ionic, Controllers are only called
            // when they are recreated or on app start, instead of every page change.
            // To listen for when this page is active (for example, to refresh data),
            // listen for the $ionicView.enter event:
            //$scope.$on('$ionicView.enter', function(e) {
            //});

            // Form data for the login modal
            $scope.loginData = {};

            // Create the login modal that we will use later
            $ionicModal.fromTemplateUrl('templates/login.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });

            // Triggered in the login modal to close it
            $scope.closeLogin = function () {
                $scope.modal.hide();
            };

            // Open the login modal
            $scope.login = function () {
                $scope.modal.show();
            };

            // Perform the login action when the user submits the login form
            $scope.doLogin = function () {
                console.log('Doing login', $scope.loginData);

                // Simulate a login delay. Remove this and replace with your login
                // code if using a login system
                $timeout(function () {
                    $scope.closeLogin();
                }, 1000);
            };
        })

        .controller('DashboardCtrl', function ($scope, Item, $ionicPlatform, $cordovaBarcodeScanner, $cordovaDatePicker, $http, $ionicPopup, $ionicLoading, $ionicModal) {

            $scope.itemData = {barcodeNumber: null, date: null, name: null};
            $scope.lastAddedItems = [];

            $scope.tags = {
                search: {name: ''},
                item: {},
                new : {name: ''},
                list: []
            };

            function refreshLastAddedItemsList() {
                Item.getAll({limit: 10, order: 'id:DESC'}).then(
                    function(data) {
                        $scope.lastAddedItems = data;
                    }
                );
            }

            $ionicPlatform.ready(function () {

                refreshLastAddedItemsList();


                $scope.addProduct = function () {
                    $cordovaBarcodeScanner.scan().then(function (barcodeData) {

                        if (barcodeData.cancelled === false) {

                            /*
                             * @TODO przenieść wyżej, ustawiać date na oststnio wybraną
                             */
                            var datePickerOptions = {
                                date: new Date(),
                                mode: 'date', // or 'time'
                                minDate: new Date() - 10000,
                                allowOldDates: false,
                                allowFutureDates: true,
                                doneButtonLabel: 'USTAW',
                                doneButtonColor: '#F2F3F4',
                                cancelButtonLabel: 'ANULUJ',
                                cancelButtonColor: '#000000'
                            };

                            $cordovaDatePicker.show(datePickerOptions).then(function (date) {

                                var year = date.getFullYear();
                                var month = date.getMonth() + 1;
                                var day = date.getDate();

                                $scope.itemData.date = year + '-' + month + '-' + day;
                                $scope.itemData.barcodeNumber = barcodeData.text;

                                /*
                                 * @TODO przeniesc wszystkie $ionicLoading zeby sie z automatu pokazywalo dla $http
                                 */
                                $ionicLoading.show({
                                    template: 'Dodawanie produktu...'
                                });

                                $http.get('http://inventory.sokar.pl/api/product/' + barcodeData.text).then(
                                        function (response) {
                                            $ionicLoading.hide();
                                            if (response.status == 200) {

                                                $http.post('http://inventory.sokar.pl/api/item', $scope.itemData).then(
                                                        function (response) {
                                                            $ionicLoading.hide();

                                                            refreshLastAddedItemsList();

                                                            /*$ionicPopup.alert({
                                                             title: 'Informacja',
                                                             template: 'Produkt dodany prawidłowo'
                                                             });*/
                                                        }, function (error) {
                                                    $ionicLoading.hide();
                                                    $ionicPopup.alert({
                                                        title: 'Błąd!',
                                                        template: 'Produkt nie został dodany!'
                                                    });
                                                });

                                            }

                                        },
                                        function (response) {
                                            $ionicLoading.hide();
                                            if (response.status == 404) {
                                                $ionicPopup.show({
                                                    template: '<input type="text" ng-model="itemData.name">',
                                                    title: 'Podaj nazwę produktu',
                                                    subTitle: 'Produkt nie znaleziony w bazie',
                                                    scope: $scope,
                                                    buttons: [
                                                        {text: 'Anuluj'},
                                                        {
                                                            text: '<b>Zapisz</b>',
                                                            type: 'button-positive',
                                                            onTap: function (e) {
                                                                if (!$scope.itemData.name) {
                                                                    e.preventDefault();
                                                                } else {
                                                                    $ionicLoading.show({
                                                                        template: 'Dodawanie produktu...'
                                                                    });

                                                                    $http.post('http://inventory.sokar.pl/api/item', $scope.itemData).then(
                                                                            function (response) {
                                                                                $ionicLoading.hide();

                                                                                refreshLastAddedItemsList();

                                                                                $scope.itemData.name = null;

                                                                                /*$ionicPopup.alert({
                                                                                 title: 'Informacja',
                                                                                 template: 'Produkt dodany prawidłowo'
                                                                                 });*/
                                                                            },
                                                                            function (error) {
                                                                                $ionicLoading.hide();
                                                                                $ionicPopup.alert({
                                                                                    title: 'Błąd!',
                                                                                    template: 'Produkt nie został dodany!'
                                                                                });
                                                                            });
                                                                }
                                                            }
                                                        }
                                                    ]
                                                });
                                            } else {
                                                $ionicPopup.alert({
                                                    title: 'Błąd!',
                                                    template: 'Nie można pobrać produktu!'
                                                });
                                            }
                                        }
                                );



                            },
                                    function () {
                                        $ionicPopup.alert({
                                            title: 'Błąd!',
                                            template: 'Nie można uruchomić datapickera!'
                                        });
                                    });

                        }
                    },
                            function () {
                                $ionicPopup.alert({
                                    title: 'Błąd!',
                                    template: 'Nie można uruchomić czytnika kodów!'
                                });

                            });
                };

                $ionicModal.fromTemplateUrl('templates/itemsToDelete.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modalItemDelete = modal;
                });

                $scope.removeProduct = function () {
                    $cordovaBarcodeScanner.scan().then(
                            function (barcodeData) {

                                if (barcodeData.cancelled === false) {

                                    $ionicLoading.show({
                                        template: 'Usuwanie produktu...'
                                    });

                                    $http.delete('http://inventory.sokar.pl/api/item/' + barcodeData.text).then(
                                            function (response) {
                                                $ionicLoading.hide();

                                                if (typeof response.data.status == 'undefined') {

                                                    $scope.itemsToDelete = response.data;

                                                    $scope.modalItemDelete.show();

                                                } else if (response.data.status) {

                                                    refreshLastAddedItemsList();

                                                    $ionicPopup.alert({
                                                        title: 'Informacja',
                                                        template: 'Produkt został usunięty'
                                                    });
                                                } else {
                                                    $ionicPopup.alert({
                                                        title: 'Błąd',
                                                        template: 'Nie ma takiego produktu!'
                                                    });
                                                }

                                            },
                                            function () {
                                                $ionicLoading.hide();

                                                $ionicPopup.alert({
                                                    title: 'Błąd!',
                                                    template: 'Problem z połączeniem!'
                                                });
                                            }
                                    );
                                }
                            },
                            function () {
                                $ionicPopup.alert({
                                    title: 'Błąd!',
                                    template: 'Nie można uruchomić czytnika kodów!'
                                });
                            }
                    );
                };

                $scope.itemDelete = function (item) {
                    $scope.modalItemDelete.hide();

                    $ionicLoading.show({
                        template: 'Usuwanie produktu...'
                    });

                    $http.delete('http://inventory.sokar.pl/api/item/' + item.id).then(
                            function (response) {
                                $ionicLoading.hide();

                                refreshLastAddedItemsList();

                                if (response.data.status) {
                                    $ionicPopup.alert({
                                        title: 'Informacja',
                                        template: 'Produkt został usunięty'
                                    });
                                } else {
                                    $ionicPopup.alert({
                                        title: 'Błąd',
                                        template: 'Nie ma takiego produktu!'
                                    });
                                }
                            },
                            function () {
                                $ionicLoading.hide();

                                $ionicPopup.alert({
                                    title: 'Błąd!',
                                    template: 'Problem z połączeniem!'
                                });
                            }
                    );

                };

                $scope.itemDeleteConfirm = function (item) {
                    $ionicPopup.confirm({
                        title: 'Usuwanie produktu',
                        template: 'Jesteś pewien?'
                    }).then(function (res) {
                        if (res) {
                            $scope.itemDelete(item);
                        }
                    });
                };

                $scope.modalItemDeleteClose = function () {
                    $scope.modalItemDelete.hide();
                };


                $ionicModal.fromTemplateUrl('templates/item-tags-dialog.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.addTagModal = modal;
                });

                function loadTags() {
                    $ionicLoading.show({template: 'Ładowanie tagów...'});

                    $scope.tags.list = [];

                    $http.get('http://inventory.sokar.pl/api/tag').then(
                            function (response) {
                                $scope.tags.search.name = '';

                                angular.forEach(response.data, function (value, key) {
                                    var checked = false;

                                    for (i = 0; i < $scope.tags.item.product.tags.length; i++) {
                                        if ($scope.tags.item.product.tags[i].id == value.id) {
                                            checked = true;
                                        }
                                    }

                                    $scope.tags.list.push({
                                        id: value.id,
                                        name: value.name,
                                        checked: checked
                                    });
                                });

                                $ionicLoading.hide();
                            }
                    );
                }

                $scope.showItemTagsDialog = function (item) {
                    $scope.tags.item = item;
                    $scope.tags.search.name = '';

                    loadTags();
                    $scope.addTagModal.show();
                };

                $scope.closeItemTagsDialog = function () {
                    $scope.addTagModal.hide();
                };


                $scope.tagSelected = function (tag) {

                    $http.put('http://inventory.sokar.pl/api/product/' + $scope.tags.item.product.barcode_number, {tags: $scope.tags.list}).then(
                            function (response) {

                                if (response.data.status) {
                                    refreshLastAddedItemsList();
                                } else {
                                    $ionicPopup.alert({
                                        title: 'Błąd',
                                        template: response.data.message
                                    });
                                }

                            },
                            function (response) {

                                $ionicPopup.alert({
                                    title: 'Błąd!',
                                    template: 'Problem z połączeniem!'
                                });
                                $scope.response = response;
                            }
                    );

                }; // END tagSelected()


                $scope.addNewTag = function () {
                    $ionicPopup.show({
                        template: '<input type="text" ng-model="tags.new.name">',
                        title: 'Podaj nazwę',
                        scope: $scope,
                        buttons: [
                            {text: 'Anuluj'},
                            {
                                text: '<b>Dodaj</b>',
                                type: 'button-positive',
                                onTap: function (e) {
                                    if (!$scope.tags.new.name) {
                                        e.preventDefault();
                                    } else {
                                        $ionicLoading.show({template: 'Dodawanie...'});

                                        $http.post('http://inventory.sokar.pl/api/tag', {name: $scope.tags.new.name}).then(
                                                function (response) {
                                                    $ionicLoading.hide();

                                                    if (typeof response.data.id !== 'undefined') {
                                                        loadTags();
                                                        /*$http.get('http://inventory.sokar.pl/api/tag').then(
                                                         function(response) {
                                                         $scope.tags.list = response.data;
                                                         $ionicLoading.hide();
                                                         
                                                         $scope.tags.new.name = '';
                                                         }
                                                         );*/


                                                    }

                                                },
                                                function (response) {
                                                    $ionicLoading.hide();

                                                    $ionicPopup.alert({
                                                        title: 'Błąd!',
                                                        template: 'Problem z połączeniem!'
                                                    });
                                                }
                                        );
                                    }
                                }
                            }
                        ]
                    });
                }; // END addNewTag()
            });

        })

        .controller('ItemCtrl', function ($scope, $stateParams, $http, $cordovaDatePicker, $ionicLoading, $ionicPopup) {
            /*
             * @TODO tu jest problem przy cofaniu. nie odswierza kontrolera do ktorego cofamy przez co nie widac wprowadzonych tu zmian.
             */
            $ionicLoading.show({template: 'Ładowanie...'});

            $scope.data = {item: {}};

            $http.get('http://inventory.sokar.pl/api/item/' + $stateParams.id).then(
                    function (response) {
                        response.data.expiration_date = moment(response.data.expiration_date).format('YYYY-MM-DD');
                        $scope.data.item = response.data;

                        $ionicLoading.hide();
                    }
            );

            $scope.changeExpDate = function () {
                var datePickerOptions = {
                    date: new Date($scope.data.item.expiration_date),
                    mode: 'date', // or 'time'
                    inDate: new Date() - 10000,
                    allowOldDates: false,
                    allowFutureDates: true,
                    doneButtonLabel: 'USTAW',
                    doneButtonColor: '#F2F3F4',
                    cancelButtonLabel: 'ANULUJ',
                    cancelButtonColor: '#000000'
                };

                $cordovaDatePicker.show(datePickerOptions).then(function (date) {

                    $scope.data.item.expiration_date = moment(date).format('YYYY-MM-DD');

                });

            };

            $scope.$watch('data.item', function (newData, oldData) {
                if (typeof oldData.expiration_date !== 'undefined') {

                    var data = {
                        opened: $scope.data.item.opened,
                        note: $scope.data.item.note,
                        expirationDate: $scope.data.item.expiration_date
                    };

                    $http.put('http://inventory.sokar.pl/api/item/' + $stateParams.id, data).then(
                            function (response) {
                                refreshLastAddedItemsList(); // @fixme to nie zadziala nie ten kontroler?
                            },
                            function (response) {
                                $scope.response = response;
                                $ionicPopup.alert({
                                    title: 'Błąd!',
                                    template: 'Problem z połączeniem!'
                                });
                            }
                    );
                }
            }, true);



        })

        .controller('ProductsCtrl', function (Product, $cordovaBarcodeScanner, $state) {

            var vm = this;

            vm.products = [];

            Product.getAll().then(function (data) {
                vm.products = data;
            });

            vm.barcodeSearch = function () {

                $cordovaBarcodeScanner.scan().then(function (barcodeData) {

                    if (barcodeData.cancelled === false) {
                        $state.go('app.product', {barcode: barcodeData.text});
                    }

                });

            }; // END vm.barcodeSearch()

        })

        .controller('ProductCtrl', function (Product, $http, $ionicLoading, $stateParams, $state, $ionicPopup) {
            var vm = this;

            vm.product = {};

            Product.getByBarcode($stateParams.barcode).then(
                function (data) {
                    vm.product = data;
                },
                function(status) {
                    
                    if (status === 404) {
                        $ionicPopup.alert({
                            title: 'Nie znaleziono produktu!',
                            template: 'Produkt z numerem barcode ' + $stateParams.barcode + ' nie został znaleziony.',
                            buttons: [
                                {
                                    text: 'OK',
                                    type: 'button-positive',
                                    onTap: function (e) {
                                        $state.go('app.products');
                                    }
                                }
                            ]
                        });
                    }
                    
                } // END function(response)
            ); // END Product.getByBarcode

        });
