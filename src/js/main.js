const WEEK_DAYS = [
    'Пн',
    'Вт',
    'Ср',
    'Чт',
    'Пт',
    'Сб',
    'Вс'
];

const HOURS = {
    START: 0,
    END: 24,
    STEP: 0.5
};

const classList = {
    DAY: {
        primary: 'day',
        highlited: 'active'
    },
    HOUR: {
        primary: 'hour',
        free: 'free',
        booked: 'booked',
        start: 'hour-start',
        end: 'hour-end'
    }
};

function CalendarHour(value) {
    this.value = value;
    this.isBooked = false;
}

CalendarHour.prototype.book = function () {
    this.isBooked = true;
}

CalendarHour.prototype.toggle = function () {
    this.isBooked = !this.isBooked;
}

function Calendar(weekDays, options) {
    this.start = options.START;
    this.end = options.END;

    this.data = Array.from({ length: weekDays }).map(_ => {
        const result = [];

        for (let i = options.START; i <= options.END; i += options.STEP) {
            result.push(new CalendarHour(i));
        }

        return result;
    });
}

Calendar.prototype.getData = function () {
    return this.filterSlots(this.start, this.end);
}

Calendar.prototype.bookFilteredSlots = function () {
    this.data.forEach(day => {
        day.forEach(hour => {
            if (hour.value >= this.start && hour.value <= this.end) {
                hour.book();
            }
        })
    });
}

Calendar.prototype.toggleTimeSlot = function (dayIndex, timeSlot) {
    const hourIndex = this.data[dayIndex].findIndex(slot => slot.value === Math.trunc(timeSlot));

    this.data[dayIndex][hourIndex].toggle();
    this.data[dayIndex][hourIndex + 1].toggle();
}

Calendar.prototype.bookTimeRange = function (timeSlotStart, timeSlotEnd) {
    this.data.forEach(day => {
        day
            .filter(timeSlot => timeSlot.value >= timeSlotStart && timeSlot.value <= timeSlotEnd)
            .forEach(timeSlot => timeSlot.book());
    });
}

Calendar.prototype.filterSlots = function (start, end) {
    this.start = start;
    this.end = end;

    return this.data.map(day => {
        if (start < end) {
            return day.filter(slot => slot.value >= start && slot.value < end);
        }

        const firstPart = day.filter(slot => slot.value >= start);
        const secondPart = day.filter(slot => slot.value < end);

        return firstPart.concat(secondPart);
    })
}

function CalendarView(model, rootHTML) {
    this.rootHTML = rootHTML;
    this.model = model;

    this.bindListeners();
}

CalendarView.prototype.bindListeners = function () {
    function isElementOrParent(el, classToCheck) {
        console.log(el, classToCheck);
        return el.classList.contains(classToCheck) || !!el.closest('.' + classToCheck);
    }

    this.rootHTML.addEventListener('click', e => {
        if (isElementOrParent(e.target, classList.HOUR.primary)) {
            const day = e.target.closest('.' + classList.DAY.primary);
            const allDays = Array.from(day.parentNode.children);
            const dayIndex = allDays.findIndex(d => d === day);
            const value = e.target.getAttribute('data-value') || e.target.querySelector('[data-value]').getAttribute('data-value');


            calendar.toggleTimeSlot(dayIndex, value);
            this.render();
        }
    });
}

CalendarView.prototype.render = function () {
    this.rootHTML.innerHTML = '';

    this.model.getData()
        .map((daySlots, index) => {
            const dayRowHTML = document.createElement('div');

            dayRowHTML.setAttribute('data-day-title', WEEK_DAYS[index]);

            // dayRowHTML.setAttribute('data-day-title', WEEK_DAYS[index]);

            dayRowHTML.classList.add(classList.DAY.primary); // class of the row

            for (let i = 0; i < daySlots.length; i++) {
                const hourBlockHTML = document.createElement('div');

                hourBlockHTML.classList.add(classList.HOUR.primary);
                hourBlockHTML.classList.add(daySlots[i].isBooked ? classList.HOUR.booked : classList.HOUR.free);
                hourBlockHTML.setAttribute('data-value', daySlots[i].value);

                if (Math.trunc(daySlots[i].value) === daySlots[i].value) {
                    hourBlockHTML.classList.add(classList.HOUR.start);
                    console.log(i)
                } else {
                    hourBlockHTML.classList.add(classList.HOUR.end);
                }

                dayRowHTML.appendChild(hourBlockHTML);
            }

            return dayRowHTML;
        })
        .forEach(div => this.rootHTML.appendChild(div));
}

const calendar = new Calendar(WEEK_DAYS.length, HOURS);
const view = new CalendarView(calendar, document.getElementById('time-table'));

view.render();

const form = document.getElementById('booking');

form.addEventListener('submit', e => {
    e.preventDefault();

    const values = e.currentTarget.elements

    const START = values.start.value;
    const END = values.end.value;

    calendar.filterSlots(parseFloat(START), parseFloat(END));
    view.render();
});

const markButton = document.getElementById('mark-range');

markButton.addEventListener('click', e => {
    calendar.bookFilteredSlots();
    view.render();
});

CalendarHour.prototype.free = function () {
    this.isBooked = false;
}

Calendar.prototype.bookFilteredClear = function () {
    this.data.forEach(day => {
        day.forEach(hour => {
            if (hour.value >= this.start && hour.value <= this.end) {
                hour.free();
            }
        })
    });
}

const clearButton = document.getElementById('clear-range');

clearButton.addEventListener('click', e => {
    calendar.bookFilteredClear();
    view.render();
});