let ps_menus = [];
// Returns the PowerSelect menu associated with target
function getPS(target) {
    let index;
    while(target != null) {
        if(target.classList.contains('ps-wrapper')) {
            index = target.getAttribute('data-ps-index');
            break;
        }
        target = target.parentNode;
    }
    if(target != null) {
        return ps_menus[index];
    }
}
// Returns true if the child is a descendant of the parent
function isDescendant(parent, child) {
    let element = child.parentNode;
    while(element != null) {
        if(element == parent) {
            return true;
        }
        element = element.parentNode;
    }
    return false;
}
// Handles when the page is clicked to see if a menu needs to close
function psHandlePageClick(event) {
    let target = event.target;
    if(!target.classList.contains('ps-chip-delete') &&
    !target.classList.contains('ps-option')) {
        for(let i = 0; i < ps_menus.length; i++) {
            let ps = ps_menus[i].wrapper;
            if(isDescendant(ps, target)) {
                if(!target.classList.contains('ps-arrow') &&
                !target.classList.contains('ps-option')) {
                    ps.classList.add('ps-active');
                }
            }
            else {
                ps.classList.remove('ps-active');
            }
        }
    }
}
function PowerSelect(args) {
    // Compares the name (innerHTML) between two HTML elements
    this.compareName = function(a, b) {
        return a.localeCompare(b);
    }
    // Deletes the last chip in the list
    this.deleteLastChip = function() {
        let chips = this.chips.getElementsByClassName('ps-chip');
        if(chips.length > 0) {
            let lastChip = chips[chips.length - 1];
            let xButton = lastChip.getElementsByClassName('ps-chip-delete')[0];
            xButton.click();
        }
    }
    // Deselects the specified option
    this.deselect = function(name) {
        let menuOption = this.getMenuOption(name);
        let selectOption = this.getSelectOption(name);
        selectOption.selected = false;
        if(this.style == 'checkbox' || !this.multiselect) {
            menuOption.classList.remove('ps-selected');
        }
        else {
            menuOption.classList.remove('ps-hidden');
            this.handleChipDelete(name);
        }
        if(this.callback) {
            this.callback();
        }
    }
    // Filters the options menu on the provided search string
    this.filterOptionsMenu = function(searchString) {
        let sanitizedString = searchString.toLowerCase().trim();
        let hidden = 0;
        for(let i = 0; i < this.options.length; i++) {
            let name = this.options[i];
            let searchName = name.toLowerCase();
            let option = this.menuOptions[name];
            // Don't show menu options that are already chips
            if(!this.isChip(name)) {
                // Search string not found in name
                if(searchName.indexOf(sanitizedString) == -1) {
                    option.classList.add('ps-hidden');
                    hidden++;
                }
                else {
                    option.classList.remove('ps-hidden');
                    hidden--;
                }
            }
            else {
                hidden++;
            }
        }
        // Show/hide 'no results' message from search
        if(hidden == this.options.length) {
            this.noresults.classList.remove('ps-hidden');
        }
        else {
            this.noresults.classList.add('ps-hidden');
        }
    }
    // Generates the HTML for a new PowerSelect menu
    this.generateHTML = function() {
        // Righthand arrow
        let arrow = document.createElement('div');
        arrow.addEventListener('keydown', this.handleArrowEnter)
        arrow.classList.add('ps-arrow');
        arrow.tabIndex = 0;

        // Chips container
        let chips = document.createElement('div');
        chips.classList.add('ps-chips');
        this.chips = chips;

        // PowerSelect head
        let head = document.createElement('div');
        head.classList.add('ps-head');
        head.appendChild(arrow);
        head.appendChild(chips);

        // Search input box
        if(this.search) {
            let input = document.createElement('input');
            input.addEventListener('focus', this.handleSearchInputFocus);
            input.addEventListener('input', this.handleSearchInput);
            input.addEventListener('keydown', this.handleSearchSpecialKeys);
            input.classList.add('ps-input');
            input.classList.add('ps-empty');
            input.type = 'text';
            chips.appendChild(input);
            this.searchInput = input;
        }

        // Option menu
        let options = document.createElement('ul');
        options.classList.add('ps-options');
        if(this.search) {
            // No results message
            let noresults = document.createElement('div');
            noresults.classList.add('ps-noresults');
            noresults.classList.add('ps-hidden');
            noresults.innerHTML = 'No Results';
            options.appendChild(noresults);
            this.noresults = noresults;
        }

        // Select menu
        let select = document.createElement('select');
        select.addEventListener('change', this.handleSelectChange);
        select.classList.add('ps-select');
        select.name = this.name;
        this.selectElement = select;
        if(this.multiselect) {
            select.multiple = true;
        }

        // Menu & sort option elements
        this.menuOptions = [];
        this.selectOptions = [];
        for(let i = 0; i < this.options.length; i++) {
            let name = this.options[i];
            let menuOption = document.createElement('li');
            menuOption.addEventListener('click', this.handleOptionClick);
            menuOption.addEventListener('keydown', this.handleOptionEnter);
            menuOption.classList.add('ps-option');
            menuOption.setAttribute('data-value', name);

            // Checkbox
            if(this.style == 'checkbox') {
                let checkbox = document.createElement('input');
                let label = document.createElement('label');
                checkbox.classList.add('ps-checkbox');
                checkbox.name = name;
                checkbox.type = 'checkbox';
                label.classList.add('ps-option-label');
                label.htmlFor = name;
                label.innerHTML = name;
                menuOption.appendChild(checkbox);
                menuOption.appendChild(label);
            }
            else {
                menuOption.innerHTML = name;
                menuOption.tabIndex = 0;
            }
            options.appendChild(menuOption);
            this.menuOptions[name] = menuOption;

            // Create select option
            let selectOption = document.createElement('option');
            selectOption.setAttribute('data-value', name);
            selectOption.innerHTML = name;
            select.appendChild(selectOption);
            this.selectOptions[name] = selectOption;
        }

        // Name label
        let label = document.createElement('label');
        label.classList.add('ps-label');
        label.innerHTML = this.name;
        label.htmlFor = this.name;
        this.label = label;

        // Single-select value field
        if(!this.multiselect) {
            let value = document.createElement('div');
            value.classList.add('ps-value');
            this.value = value;
        }

        // Checkbox count
        if(this.style == 'checkbox') {
            let count = document.createElement('div');
            count.classList.add('ps-count');
            count.innerHTML = '(0 selected)';
            this.checkboxCount = count;
        }

        // Component wrapper
        let wrapper = document.createElement('div');
        wrapper.addEventListener('click', this.handlePSClick);
        wrapper.classList.add('ps-wrapper');
        wrapper.classList.add('ps-none-selected');
        wrapper.setAttribute('data-ps-index', ps_menus.length);
        wrapper.appendChild(label);
        wrapper.appendChild(select);
        if(this.expand) {
            wrapper.classList.add('ps-expand');
        }
        if(this.persistentLabel) {
            wrapper.classList.add('ps-persist-label');
        }
        if(this.multiselect) {
            wrapper.classList.add('ps-multi');
        }
        else {
            wrapper.appendChild(this.value);
        }
        if(this.search) {
            wrapper.classList.add('ps-searchable');
        }
        if(this.style == 'checkbox') {
            wrapper.classList.add('ps-style-checkbox');
            wrapper.appendChild(this.checkboxCount);
        }
        wrapper.appendChild(head);
        wrapper.appendChild(options);
        this.wrapper = wrapper;
    }
    // Returns the specified chip element
    this.getChip = function(name) {
        return this.chipElements[name];
    }
    // Returns the specified select option element
    this.getMenuOption = function(name) {
        return this.menuOptions[name];
    }
    // Returns the specified option element
    this.getSelectOption = function(name) {
        return this.selectOptions[name];
    }
    // Handles when the user presses the enter button when down arrow is focused
    this.handleArrowEnter = function(event) {
        let target = event.target;
        let ps = getPS(target);
        if(event.key === 'Enter') {
            ps.wrapper.classList.toggle('ps-active');
        }
    }
    // Handles removing chips with the specified name
    this.handleChipDelete = function(name) {
        let delay = 100;
        let chip = this.getChip(name);
        let menuOption = this.getMenuOption(name);
        let selectOption = this.getSelectOption(name);
        let ps = this;
        // Remove selected value from selected array
        ps.selected = ps.selected.filter(function(value, index, selected) {
            return value != name;
        });
        if(chip) {
            chip.classList.add('ps-hidden');
            menuOption.classList.remove('ps-hidden');
            selectOption.selected = false;
            // Smoothly remove from chips list
            setTimeout(function() {
                let chips = chip.parentNode;
                if(chips) {
                    let expectedChildren = 0;
                    if(ps.search) {
                        expectedChildren = 1;
                    }
                    chips.removeChild(chip);
                    if(chips.children.length == expectedChildren) {
                        ps.wrapper.classList.add('ps-none-selected');
                    }
                }
                // Delete pointers
                if(ps.chipElements[name]) {
                    delete ps.chipElements[name];
                }
                if(ps.xButtons[name]) {
                    delete ps.xButtons[name];
                }
            }, delay);
            // Trigger callback
            if(this.callback) {
                this.callback();
            }
        }
    }
    // Handles when a chip is deleted
    this.handleChipDeleteClick = function(event) {
        let target = event.target;
        let chip = target.parentNode;
        let ps = getPS(target);
        let name = chip.getAttribute('data-value');
        ps.handleChipDelete(name);
    }
    // Handles when the user presses enter on a focused chip delete button
    this.handleChipDeleteEnter = function(event) {
        if(event.key === 'Enter') {
            let chip = this.parentNode;
            let name = chip.getAttribute('data-value');
            let target = event.target;
            let ps = getPS(target);
            let nextChip = chip.nextSibling;
            ps.handleChipDelete(name);
            // Focus next chip xButton if there is one
            if(nextChip && nextChip.classList.contains('ps-chip')) {
                let nextName = nextChip.getAttribute('data-value');
                let xButton = ps.xButtons[nextName];
                xButton.focus();
            }
            // Otherwise focus search input if there is one
            else if(ps.search) {
                ps.searchInput.focus();
            }
        }
    }
    // Handles when the search input box receives user input
    this.handleSearchInput = function(event) {
        let target = event.target;
        let ps = getPS(target);
        // If the search string is blank
        if(this.value == '') {
            ps.searchInput.classList.add('ps-empty');
            ps.noresults.classList.add('ps-hidden');
            ps.showAllMenuOptions();
        }
        // If any search occurs
        else {
            ps.searchInput.classList.remove('ps-empty');
            ps.filterOptionsMenu(target.value);
        }
    }
    // Handles when the search input box receives focus (click or tab)
    this.handleSearchInputFocus = function(event) {
        let target = event.target;
        let ps = getPS(target);
        ps.wrapper.classList.add('ps-active');
    }
    // Handles when an option has been selected
    this.handleOptionChoice = function(name) {
        let menuOption = this.getMenuOption(name);
        let selectOption = this.getSelectOption(name);
        selectOption.selected = true;
        if(this.multiselect) {
            // Remove from selected value array
            this.selected = this.selected.filter(function(value, index, selected) {
                return value != name;
            });
            // Chip (default) variant
            if(this.style == 'chip') {
                menuOption.classList.add('ps-hidden');
                this.makeChip(name);
                this.selected.push(name);
                this.wrapper.classList.remove('ps-none-selected');
            }
            // Checkbox variant
            if(this.style == 'checkbox') {
                let checkbox = menuOption.children[0];
                // If checked, uncheck
                if(menuOption.classList.contains('ps-selected')) {
                    checkbox.checked = false;
                    menuOption.classList.remove('ps-selected');
                    // Remove from selected value array
                    this.selected = this.selected.filter(function(value, index, selected) {
                        return value != name;
                    });
                    // If selected value array is empty
                    if(this.selected.length == 0) {
                        this.wrapper.classList.add('ps-none-selected');
                    }
                }
                // If unchecked, check
                else {
                    checkbox.checked = true;
                    menuOption.classList.add('ps-selected');
                    this.selected.push(name);
                    this.wrapper.classList.remove('ps-none-selected');
                }
                this.checkboxCount.innerHTML = '(' + this.selected.length + ' selected)';
            }
        }
        // Single select
        else {
            menuOption.classList.add('ps-selected');
            if(this.lastSelection) {
                this.lastSelection.classList.remove('ps-selected');
            }
            this.lastSelection = menuOption;
            this.selected = name;
            this.value.innerHTML = name;
            this.wrapper.classList.remove('ps-active');
            this.wrapper.classList.remove('ps-none-selected');
        }
        // Reset search query
        if(this.search) {
            this.searchInput.value = '';
            this.showAllMenuOptions();
        }
        // Trigger callback
        if(this.callback) {
            this.callback();
        }
    }
    // Handles when an option in the dropdown menu is clicked
    this.handleOptionClick = function(event) {
        let name = this.getAttribute('data-value');
        let target = event.target; 
        let ps = getPS(target);
        ps.handleOptionChoice(name);
    }
    // Handles when an option is focused and a user presses Enter
    this.handleOptionEnter = function(event) {
        let name = this.getAttribute('data-value');
        let target = event.target;
        if(event.key === 'Enter') {
            let target = event.target;
            let ps = getPS(target);
            ps.handleOptionChoice(name);
        }
        // Focus next visible element
        do {
            if(!target.classList.contains('ps-hidden')) {
                target.focus();
                break;
            }
            target = target.nextSibling;
        }
        while(target != null);
    }
    // Handles when the PowerSelect element is clicked
    this.handlePSClick = function(event) {
        let target = event.target;
        let ps = getPS(target);
        if(target.classList.contains('ps-input')) {
            ps.wrapper.classList.add('ps-active');
        }
        else if(
            target.classList.contains('ps-arrow') ||
            target.classList.contains('ps-chips') ||
            target.classList.contains('ps-head') ||
            target.classList.contains('ps-label') ||
            target.classList.contains('ps-value') ||
            target.classList.contains('ps-wrapper')
        ) {
            ps.wrapper.classList.toggle('ps-active');
        }
        // If active
        if(ps.wrapper.classList.contains('ps-active') && ps.search) {
            ps.searchInput.focus();
        }
    }
    // Handle special keys in the search input box
    this.handleSearchSpecialKeys = function(event) {
        let target = event.target;
        let ps = getPS(target);
        if(event.key === 'ArrowDown') {
            let firstOption = ps.options[0];
            let option = ps.menuOptions[firstOption];
            do {
                if(!option.classList.contains('ps-hidden')) {
                    option.focus();
                    break;
                }
                option = option.nextSibling;
            }
            while(option != null);
        }
        else if(event.key === 'Enter') {
            let firstOption = ps.options[0];
            let option = ps.menuOptions[firstOption];
            do {
                if(!option.classList.contains('ps-hidden')) {
                    let name = option.getAttribute('data-value');
                    ps.handleOptionChoice(name);
                    break;
                }
                option = option.nextSibling;
            }
            while(option != null);
        }
        else if(event.key === 'Backspace' && target.value == '') {
            ps.deleteLastChip();
            ps.showAllMenuOptions();
        }
    }
    // Handles updates to the select menu (mobile & accessibility)
    this.handleSelectChange = function(event) {
        let target = event.target;
        let ps = getPS(target);
        let options = ps.selectElement.children;
        ps.wrapper.classList.remove('ps-none-selected');
        if(ps.multiselect) {
            // Iterate through select menu options
            for(let i = 0; i < options.length; i++) {
                let name = options[i].value;
                if(ps.style == 'checkbox') {
                    let option = ps.getMenuOption(name);
                    let checkbox = option.children[0];
                    if(options[i].selected) {
                        // Select option
                        checkbox.checked = true;
                        option.classList.add('ps-selected');
                    }
                    else {
                        // Deselect option
                        checkbox.checked = false;
                        option.classList.remove('ps-selected');
                    }
                }
                else {
                    if(options[i].selected) {
                        // Hide menu option
                        let menuOption = ps.menuOptions[name];
                        menuOption.classList.add('ps-hidden');
                        // Make chip if one doesn't already exist
                        if(!ps.chipElements[name]) {
                            ps.makeChip(name);
                        }
                    }
                    else {
                        // Remove chip if exists
                        if(ps.chipElements[name]) {
                            let chip = ps.chipElements[name];
                            let parent = chip.parentNode;
                            if(parent) {
                                parent.removeChild(chip);
                            }
                            // Delete pointers
                            delete ps.chipElements[name];
                            delete ps.xButtons[name];
                        }
                        // Unhide menu option
                        let menuOption = ps.menuOptions[name];
                        menuOption.classList.remove('ps-hidden');
                    }
                }
            }
        }
        // Single-select mode
        else {
            let name = target.value;
            let menuOption = ps.menuOptions[name];
            // Deselect last menu option
            if(ps.lastSelection) {
                ps.lastSelection.classList.remove('ps-selected');
            }
            menuOption.classList.add('ps-selected');
            ps.value.innerHTML = name;
            ps.wrapper.classList.remove('ps-active');
            ps.lastSelection = menuOption;
        }
        if(ps.callback) {
            ps.callback();
        }
    }
    // Initalize PowerSelect menu
    this.init = function(args) {
        try {
            // Check for args
            if(!args) {
                throw 'You must provide configuration options for PowerSelect!'
            }
            // Validate callback option
            if(args['callback']) {
                if(typeof args['callback'] === 'function') {
                    this.callback = args['callback'];
                }
                else {
                    throw 'The PowerSelect callback option must be a function!';
                }
            }
            // Validate expand option
            if(args['expand']) {
                if(typeof args['expand'] === 'boolean') {
                    this.expand = args['expand'];
                }
                else {
                    throw 'The PowerSelect expand argument must be a boolean value!';
                }
            }
            if(args['id']) {
                this.id = args['id'];
            }
            // Validate multiselect option
            if(args['multiselect']) {
                if(typeof args['multiselect'] === 'boolean') {
                    this.multiselect = args['multiselect'];
                    this.style = 'chip';
                }
                else {
                    throw 'The PowerSelect multiselect argument must be a boolean value!';
                }
            }
            // Validate name argument
            if(args['name']) {
                if(typeof args['name'] === 'string') {
                    this.name = args['name'];
                }
                else {
                    throw 'The PowerSelect component name must be a string!';
                }
            }
            else {
                throw 'You must specify a name for the PowerSelect component!';
            }
            // Validate options list
            if(args['options']) {
                this.options = args['options'];
            }
            // Validate persistent label option
            if(args['persistentLabel']) {
                if(typeof args['persistentLabel'] === 'boolean') {
                    this.persistentLabel = args['persistentLabel'];
                }
                else {
                    throw 'The PowerSelect persistentLabel argument must be a boolean value!';
                }
            }
            // Validate search option
            if(args['search']) {
                if(typeof args['search'] === 'boolean') {
                    this.search = args['search'];
                }
                else {
                    throw 'The PowerSelect search argument must be a boolean value!';
                }
            }
            // Validate sort option
            if(args['sort']) {
                if(typeof args['sort'] === 'boolean') {
                    this.sort = args['sort'];
                }
                else {
                    throw 'The PowerSelect sort argument must be a boolean value!';
                }
            }
            // Validate style option
            if(args['style']) {
                if(typeof args['style'] === 'string') {
                    if(!this.multiselect) {
                        console.warn('The PowerSelect checkbox style must be used with multiselect:true, this change has been applied');
                        this.multiselect = true;
                    }
                    if(args['style'] == 'checkbox' || args['style'] == 'chip') {
                        this.style = args['style'];
                    }
                    else {
                        throw 'The PowerSelect style argument must be either "checkbox" or "chip"!';
                    }
                }
                else {
                    throw 'The PowerSelect style argument must be a string!';
                }
            }
            // Sort menu
            if(this.sort) {
                this.options.sort(this.compareName);
            }
            this.chipElements = [];
            this.selected = [];
            this.xButtons = [];
            this.index = ps_menus.length;
            this.generateHTML();
            ps_menus.push(this);
            // Detect if mobile
            if(window.mobileAndTabletCheck()) {
                this.wrapper.classList.add('ps-mobile');
                this.mobile = true;
            }
        }
        catch(err) {
            console.error(err);
        }
    }
    // Returns true if there is a chip with the specified name, false otherwise
    this.isChip = function(name) {
        if(this.chipElements[name]) {
            return true;
        }
        else {
            return false;
        }
    }
    // Makes a new chip with the specified name
    this.makeChip = function(name) {
        let chip = document.createElement('div');
        let chipName = document.createElement('div');
        let xButton = document.createElement('i');
        chipName.classList.add('ps-chip-name')
        chipName.innerHTML = name;
        xButton.classList.add('ps-chip-delete');
        xButton.innerHTML = '&#x2716'; // ✖
        xButton.tabIndex = 0;
        xButton.addEventListener('click', this.handleChipDeleteClick);
        xButton.addEventListener('keydown', this.handleChipDeleteEnter);
        chip.setAttribute('data-value', name);
        chip.classList.add('ps-chip');
        chip.classList.add('ps-hidden');
        chip.appendChild(chipName);
        chip.appendChild(xButton);
        // Add to DOM
        if(this.search) {
            this.chips.insertBefore(chip, this.searchInput);
        }
        else {
            this.chips.appendChild(chip);
        }
        window.requestAnimationFrame(function() {
            chip.classList.remove('ps-hidden');
        });
        // Create chip pointer
        this.chipElements[name] = chip;
        this.xButtons[name] = xButton;
    }
    // Resets the PowerSelect component to its initialization point
    this.reset = function() {
        let options = this.selectElement.children;
        this.wrapper.classList.add('ps-none-selected');
        // Multiselect
        if(this.multiselect) {
            for(let i = 0; i < options.length; i++) {
                let option = options[i];
                let name = option.getAttribute('data-value');
                let selectOption = this.getSelectOption(name);
                let menuOption = this.getMenuOption(name);
                selectOption.selected = false;
                // Checkbox style
                if(this.style == 'checkbox') {
                    let checkbox = menuOption.children[0];
                    checkbox.checked = false;
                    menuOption.classList.remove('ps-selected');
                }
                // Chip style
                else {
                    this.handleChipDelete(name);
                    menuOption.classList.remove('ps-hidden');
                }
            }
        }
        // Single selection
        else {
            if(this.lastSelection) {
                let option = this.lastSelection;
                let name = option.getAttribute('data-value');
                let selectOption = this.getSelectOption(name);
                option.classList.remove('ps-selected');
                selectOption.selected = false;
            }
            this.value.innerHTML = '';
            this.lastSelection = null;
        }
        // Trigger callback
        if(this.callback) {
            this.callback();
        }
    }
    // Selects the option with the specified name
    this.select = function(name) {
        this.handleOptionChoice(name);
    }
    // Shows all of the options in the menu
    this.showAllMenuOptions = function() {
        for(let i = 0; i < this.options.length; i++) {
            let name = this.options[i];
            let option = this.menuOptions[name];
            if(!this.isChip(name)) {
                option.classList.remove('ps-hidden');
            }
        }
    }
    // Run the init function when the PowerSelect is instantiated
    this.init(args);
}
window.addEventListener('click', psHandlePageClick);