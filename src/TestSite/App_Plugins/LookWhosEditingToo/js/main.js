$(window).load(
    function () {

        // Declare a proxy to reference the hub. 
        var editing = $.connection.editingHub;

        var injector = angular.element('#umbracoMainPageBody').injector();

        var editingResource = injector.get('lookWhosEditingTooResource');

        angular.element('#umbracoMainPageBody').scope().$on('$viewContentLoaded', function () {

            if (location.hash.indexOf('/content') == 1 && location.hash.indexOf('edit') != -1) {
                var locArray = location.hash.split('/');
                var contentNodeId = locArray[locArray.length - 1];

                var authResource = injector.get('authResource');

                authResource.getCurrentUser().then(function (user) {

                    $.connection.hub.start().done(function () {
                        editing.server.send(contentNodeId, user.id);
                    });

                    $.cookie('lookWhosEditingTooUser', user.id);

                    editingResource.setEdit(contentNodeId, user.id);
                });

            }
            else {
                console.log($.cookie('lookWhosEditingTooUser') + ' not on content');

                $.connection.hub.start().done(function () {
                    editing.server.send(-1, $.cookie('lookWhosEditingNowUser'));
                });

                editingResource.deleteByUserId($.cookie('lookWhosEditingNowUser'));
            }
        });



        // Create a function that the hub can call to broadcast messages.
        editing.client.broadcastEdit = function (nodeId, userId) {

            var currentNodeId = -1;
            if (location.hash.indexOf('/content') == 1 && location.hash.indexOf('edit') != -1) {
                var locArray = location.hash.split('/');
                var currentNodeId = locArray[locArray.length - 1];
            }
            console.log("user " + userId + " is now on node " + nodeId);

            $("i[title*='content/content/edit']").closest("li").children("div").removeClass("look-whos-editing-too");


            //get all edits
            console.log(Math.floor(Date.now() / 1000) + " start get all edits");
            editingResource.getAllEdits().then(function (resp) {
                console.log(Math.floor(Date.now() / 1000) + " done get all edits");
                console.log(resp.data);

                $("#look-whos-editing-too").empty();

                for (var i = 0; i < resp.data.length; i++) {
                    var edit = resp.data[i];
                    $("i[title*='" + edit.nodeId + "']").closest("li").children("div").addClass("look-whos-editing-too");

                    if ($("#look-whos-editing-too").length == 0) {
                        $("ng-form[name='contentNameForm']").parent().parent().children(".span5").prepend("<div id='look-whos-editing-too'></div>");
                    }

                    if ($("#look-whos-editing-too-" + edit.userId).length == 0 && currentNodeId == edit.nodeId)
                        $("#look-whos-editing-too").append("<img id='look-whos-editing-too-" + edit.userId + "'src='//www.gravatar.com/avatar/" + edit.userGravatar + ".jpg?s=30&d=mm' alt='" + edit.userName + "' >");

                }

            });




        };


    }
);