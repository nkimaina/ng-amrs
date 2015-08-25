/* global angular */
/*
jshint -W003, -W026
*/
(function () {
    'use strict';

    angular
        .module('app.clinicDashboard')
        .directive('monthlyAppointment', appointmentSchedule);

    function appointmentSchedule() {
        return {
            restict: 'E',
            scope: { locationUuid: '@', selected: '=' },
            controller: monthlyAppointmentController,
            link: monthlyAppointmentLink,
            templateUrl: 'views/clinic-dashboard/monthly-appointment.html'
        };
    }

    monthlyAppointmentController.$inject = ['$scope', 'EtlRestService', 'AppointmentScheduleModel', 'moment'];

    function monthlyAppointmentController($scope, EtlRestService, AppointmentScheduleModel, moment) {
        this.moment = moment;
    }

    function monthlyAppointmentLink(scope, element, attrs, vm) {
        attrs.$observe('locationUuid', onLocationUuidChanged);


        function onLocationUuidChanged(newVal, oldVal) {
            if (newVal && newVal != '') {

            }
        }
		
		
        //calender view
        scope.selected = _removeTime(scope.selected || vm.moment());
        scope.month = scope.selected.clone();

        var start = scope.selected.clone();
        start.date(1);
        _removeTime(start.day(0));

        _buildMonth(scope, start, scope.month);

        scope.select = function (day) {
            scope.selected = day.date;
        };

        scope.next = function () {
            var next = vm.moment().month.clone();
            _removeTime(next.month(next.month() + 1)).date(1);
            scope.month.month(scope.month.month() + 1);
            _buildMonth(scope, next, scope.month);
        };

        scope.previous = function () {
            var previous = scope.month.clone();
            _removeTime(previous.month(previous.month() - 1).date(1));
            scope.month.month(scope.month.month() - 1);
            _buildMonth(scope, previous, scope.month);
        };

        scope.getData = function (day) {
            return "";

        }

        scope.bringCurrentMonthIntoView = function (day) {
            
            scope.selected = _removeTime(vm.moment("1995-12-25"));
            scope.month = scope.selected.clone();

            var start = scope.selected.clone();
            start.date(1);
            _removeTime(start.day(0));

            _buildMonth(scope, start, scope.month);
        }


    }

    function _removeTime(date) {
        return date.day(0).hour(0).minute(0).second(0).millisecond(0);
    }

    function _buildMonth(scope, start, month) {
        scope.weeks = [];
        var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
        while (!done) {
            scope.weeks.push({ days: _buildWeek(date.clone(), month) });
            date.add(1, "w");
            done = count++ > 2 && monthIndex !== date.month();
            monthIndex = date.month();
        }
    }

    function _buildWeek(date, month) {
        var days = [];
        for (var i = 0; i < 7; i++) {
            days.push({
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date
            });
            date = date.clone();
            date.add(1, "d");
        }
        return days;
    }



})();