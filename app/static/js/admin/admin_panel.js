$(document).ready(function () {

    var API_ROOT = 'http://127.0.0.1:5000/';
    CKEDITOR.dtd.$editable.span = 1;
    CKEDITOR.dtd.$editable.a = 1;

    //var paramsDecoder = function(url) {
    //    console.log(url);
    //  return JSON.parse('{"' + decodeURI(url.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
    //    //return decodeURI(url);
    //};

    function getJsonFromUrl(url) {
      var query = url;
      var result = {};
      query.split("&").forEach(function(part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
      });
      return result;
    }

    var streams = {
        title: '',
        edit: false,
        create: false,
        sorting: false,
        listClass: 'child-opener-image-column',
        width: '5%',

        display: function (sensorData) {
            //Create an image that will be used to open child table
            var $img = $('<i class="glyphicon glyphicon-sort-by-attributes child-opener-image"  data-toggle="tooltip" title="Expand Streams"/>');
            //Open child table when user clicks the image
            $img.click(function () {
                $('#sites').jtable('openChildTable',
                    $img.closest('tr'),
                    {
                        paging: true, //Enable paging
                        pageSize: 100, //Set page size (default: 10)
                        sorting: true, //Enable sorting
                        defaultSorting: 'timeValue ASC', //Set default sorting
                        title: "Streams of '" + sensorData.record.name + "' sensor",
                        selecting: true, //Enable selecting
                        multiselect: true, //Allow multiple selecting
                        selectingCheckboxes: true, //Show checkboxes on first column
                        actions: {
                            listAction: API_ROOT + "getDataStream?jTable=1&dataStreamId=" + sensorData.record._id,
                            updateAction: '/Demo/UpdatePhone'
                        },
                        fields: {
                            timeValue: {
                                key: true,
                                title: "Timestamp",
                                edit: false
                                //type: "date",
                                //sort: true,
                                //edit: false
                            },
                            value: {
                                title: 'Captured Value',
                                edit: false
                                //edit: false,
                                //sort: true
                            },
                            isVisible: {
                                title: 'Visibility',
                                // width: '15%',
                                type: 'checkbox',
                                values: {
                                    'false': 'Invisible',
                                    'true': 'Visible'
                                },
                                defaultValue: 'true'
                            }
                        }
                    }, function (data) { //opened handler
                        data.childTable.jtable('load');
                    });
            });
            //Return image to show on the person row
            return $img;
        }
    };


    $('#sites').jtable({
        title: 'Sites',
        sorting: true, //Enable sorting
        actions: {
            //listAction: API_ROOT + 'admin/sites',
            listAction: function(postData, jtParams) {
                    return $.Deferred(function ($dfd) {
                        $.ajax({
                            url: API_ROOT + 'admin/sites',
                            type: 'GET',
                            dataType: 'json',
                            //data: postData,
                            success: function (data) {
                                console.log(data);
                                $dfd.resolve(data);
                            },
                            error: function (err) {
                                console.log(err);
                                $dfd.reject(err);
                            }
                        });
                    });
                },
            createAction: function(postData) {
                    return $.Deferred(function ($dfd) {
                        $.ajax({
                            url: API_ROOT + 'admin/site',
                            type: 'POST',
                            dataType: 'json',
                            data: postData,
                            success: function (data) {
                                $dfd.resolve(data);
                            },
                            error: function () {
                                $dfd.reject();
                            }
                        });
                    });
                },
            updateAction: function(postData, jtParams) {
                    return $.Deferred(function ($dfd) {
                        var parsedData = getJsonFromUrl(postData);
                        var _id = parsedData._id;
                        delete parsedData._id;
                        console.log(parsedData);
                        $.ajax({
                            url: API_ROOT + 'admin/site/' + _id,
                            type: 'PUT',
                            dataType: 'json',
                            data: parsedData,
                            success: function (data) {
                                $dfd.resolve(data);
                            },
                            error: function () {
                                $dfd.reject();
                            }
                        });
                    });
                },
            deleteAction: function(postData) {
                    return $.Deferred(function ($dfd) {
                        $.ajax({
                            url: API_ROOT + 'admin/site/' + postData._id,
                            type: 'DELETE',
                            dataType: 'json',
                            //data: postData,
                            success: function (data) {
                                $dfd.resolve(data);
                            },
                            error: function () {
                                $dfd.reject();
                            }
                        });
                    });
                }
        },
        fields: {
            _id: {
                key: true,
                list: false
            },
            sensors: {
                create: false,
                edit: false,
                list: false
            },

            //Sensors
            Sensors: {
                //paging: true, //Enable paging
                //pageSize: 10, //Set page size (default: 10)
                title: '',
                sorting: false,
                create: false,
                edit: false,
                display: function (siteData) {
                    //Create an image that will be used to open child table
                    var $img = $('<i class="glyphicon glyphicon-sort-by-attributes child-opener-image" data-toggle="tooltip" title="Expand Sensors"/>');

                    //Open child table when user clicks the image
                    $img.click(function () {
                        $('#sites').jtable('openChildTable',
                            $img.closest('tr'),
                            {
                                title: "Sensors of " + siteData.record.name,
                                actions: {
                                    listAction: function (postData, jtParams) {
                                        return $.Deferred(function ($dfd) {
                                            $dfd.resolve({
                                                "Result": "OK",
                                                "Records": siteData.record.sensors
                                            });
                                        });
                                    },
                                    deleteAction: '/Demo/DeletePhone',
                                    updateAction: '/Demo/UpdatePhone',
                                    createAction: '/Demo/CreatePhone'
                                },
                                fields: {
                                    _id: {
                                        key: true,
                                        list: false,
                                        type: 'hidden'
                                    },
                                    Streams: streams,
                                    name: {
                                        title: "Name"
                                    },
                                    units: {
                                        title: 'Units',
                                        width: '30%',
                                        display: function (data) {
                                            console.log(data);
                                            return data.record.units.toString();
                                        }
                                    }
                                }
                            }, function (data) { //opened handler
                                data.childTable.jtable('load');
                            });
                    });
                    //Return image to show on the person row
                    return $img;
                }
            },

            name: {
                title: 'Site Name'
            },
            description: {
                title: 'Description',
                type: 'textarea',
                list: false
            },
            overview: {
                title: 'Overview',
                width: '20%',
                type: 'textarea',
                list: false
            },
            x: {
                title: 'Lat',
                list: false
            },
            y: {
                title: 'Lng',
                list: false
            },
            location: {
                title: 'Location',
                create: false,
                edit: false,
                display: function (data) {
                    console.log("x: " + data.record.location.x + " y: " + data.record.location.y);
                    return "x: " + data.record.location.x + " y: " + data.record.location.y;
                }
            }
        },
        formCreated: function (event, data) {
            //http://stackoverflow.com/questions/27353919/mvc-net-4-how-to-use-ckeditor-with-textarea-inside-jtable-popup
            overviewBody = CKEDITOR.replace('Edit-overview', {width: '600px'});
            descriptionBody = CKEDITOR.replace('Edit-description', {width: '600px'});

            data.form.find('input[name="name"]').addClass('validate[required]');
            //data.form.find('input[name="description"]').addClass('validate[required]');
            //data.form.find('input[name="overview"]').addClass('validate[required]');
            data.form.find('input[name="x"]').addClass('validate[required]');
            data.form.find('input[name="y"]').addClass('validate[required]');


            data.form.find('input[name="x"]').val(data.record.location.x);
            data.form.find('input[name="y"]').val(data.record.location.y);

            //descriptionBody = CKEDITOR.replace('description', { width: '600px' });
            //$($(data.form.parent()).parent()).css('left', '300px');
            //$($(data.form.parent()).parent()).css('top', '30px');
            //data.form.validationEngine();
        },
        formSubmitting: function (event, data) {
            $('textarea#Edit-overview').val(overviewBody.getData());
            $('textarea#Edit-description').val(descriptionBody.getData());
            return data.form.validationEngine('validate');
        },
        formClosed: function (event, data) {
            data.form.validationEngine('hide');
            data.form.validationEngine('detach');
        }
    }).jtable('load');
});