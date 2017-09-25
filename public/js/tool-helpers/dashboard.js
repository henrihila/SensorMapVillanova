var Dashboard = {
    state: 'closed',
    _addFastDrag: function() {
        $("div .split-pane-divider").addClass("fast-drag");
        $("div .split-pane-component").addClass("fast-drag");
    },
    _removeFastDrag: function () {
        $("div .split-pane-divider").removeClass("fast-drag");
        $("div .split-pane-component").removeClass("fast-drag");
    },
    _initListeners: function () {
        var _this = this;

        // TODO: Check mouseup alternative
        $("#my-divider").on("mousedown", function () {
            _this._addFastDrag();
        });

        $('button[id="maximize"]').on('click', function () {
            _this._removeFastDrag();
            _this.maximizeToolbar();
        });

        $('button[id="close"]').on('click', function () {
            _this._removeFastDrag();
            _this.closeToolbar();
        });
    },
    _initSections: function () {
      this.aboutSection.reset();
      this.dataViewerSection.reset();
    },
    _minToMax: function() {
        $('#my-divider').addClass('invisible');
        $("#left-component").removeClass('closed').removeClass('minimized-l').addClass('maximized-l');
        $("#right-component").removeClass('minimized-r').removeClass('maximized-r').addClass('closed');
        $('div.split-pane').splitPane('lastComponentSize', 0);
        $("#maximize").find($("span")).replaceWith('<span class="glyphicon glyphicon-resize-small"></span>');
        this.state = "maximized";
    },
    _maxToMin: function() {
        $('#my-divider').removeClass('invisible');
        var width =  parseInt($("#left-component").removeClass('closed').removeClass('maximized-l').addClass('minimized-l')
            .css("min-width"));
        $("#right-component").removeClass('closed').removeClass('maximized-r').addClass('minimized-r');
        $('div.split-pane').splitPane('firstComponentSize', width);
        $("#maximize").find($("span")).replaceWith('<span class="glyphicon glyphicon-resize-full"></span>');
        this.state = "minimized";
    },
    init: function() {
        $('div.split-pane').splitPane();
        this.closeToolbar(); //This ensures the proper initial state
        this._initSections();
        this._initListeners();
    },
    maximizeToolbar: function() {
        this._addFastDrag();
        if (this.state === "minimized") {
            this._minToMax();
        } else {
            this._maxToMin();
        }
        this._removeFastDrag();
    },
    openToolbar: function() {
        this.state="minimized";
        this._addFastDrag();
        if ($(document).width() < 845) { // TODO: Handle this better - Mobile
            this._minToMax();
        } else {
            $('#my-divider').removeClass('invisible');
            var width = parseInt($("#left-component").removeClass('closed').removeClass('maximized-l')
                .addClass('minimized-l').css("min-width"));
            $("#right-component").removeClass('closed').removeClass('maximized-r').addClass('minimized-r');
            $('div.split-pane').splitPane('firstComponentSize', width);
        }
        this._removeFastDrag();
        // Shift center of map to the right by half width of the sidebar
        // offsetCenter(map.getCenter(), -($(window).width() * 0.15), 0);
    },
    closeToolbar: function() {
        this.state = "closed";
        this._addFastDrag();
        $('#my-divider').addClass('invisible');
        $("#left-component").removeClass('minimized-l').removeClass('maximized-l').addClass('closed');
        $("#right-component").removeClass('closed').removeClass('minimized-r').addClass('maximized-r');
        $('div.split-pane').splitPane('firstComponentSize', 0);
        this._removeFastDrag();
    },
    // clearDashboardSelectedSensors: function() {
    //     $("#sensors-charts").empty().replaceWith('<div id="sensors-charts"></div>');
    // },
    aboutSection: {
        set: function (siteTitle, content) {
            $('a#about-site-title').text("About " + siteTitle);
            $('#site-about').empty().append(content);
        },
        reset: function() {
            this.set('', NOT_SELECTED_SITE_WARNING);
        }
    },
    dataViewerSection: {
        set: function (content) {
            // $('#collapse2').empty().append(content);
            // //Init Switch
            // $("[name='average-checkbox']").bootstrapSwitch();
            //
            // //Init datepickers TODO: This should be placed together with the stored html in the database
            // $('.input-daterange').datepicker({endDate: "today", todayBtn: "linked"});
            // $('.input-daterange').find('input[name="start"]').datepicker('setDate', "04/04/2016").datepicker('update');
            // $('.input-daterange').find('input[name="end"]').datepicker('setDate', "today").datepicker('update');
        },
        reset: function() {
            this.set('', NOT_SELECTED_SITE_WARNING);
        }
    },
    clear: function () {
        this._resetSections();
    },
    _resetSections: function () {
        this.aboutSection.reset();
        // this.dataViewerSection.reset();
    }
};

function openToolbar() {
    Dashboard.openToolbar();
}

function clearDashboard() {
	Dashboard.clear();
}

$(document).ready(function() {
    Dashboard.init();

    //TODO: Check handheld threshhold from css
    $(window).resize(function() {
        if ($(window).width() < 845) {
            if (Dashboard.state != "closed") {
                Dashboard.closeToolbar();
            }
        }
    });

	$(".nav-tabs a").click(function() {
		$(this).tab('show');
	});

});