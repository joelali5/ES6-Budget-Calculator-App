let budgetController = (() => {
    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        percentagePerItem(budget) {
            this.percentage = Math.round((this.value / budget) * 100);
        }

        getPercentage() {
            return this.percentage;
        }
    }

    class Budget {
        constructor(value) {
            this.value = value;
        }
    }

    const data = {
        budget: 0,

        expense: [],

        totalExpense: 0,

        percentage: -1,

        balance: 0
    };

    const totalExpense = () => {
        let sum = 0;
        data.expense.map(cur => {
            sum +=cur.value;
        });
        data.totalExpense = sum;
    };

    return {
        addBudget: (val) => {
            let newBudget;
            //Create new budget
            newBudget = new Budget(val);

            //Add new budget to the data structure
            data.budget = newBudget.value;

            //Return new budget
            return newBudget.value;
        },

        addExpense: (des, val) => {
            let ID, newExpense;
            //create an ID for each expense item
            if(data.expense.length > 0){
                ID = data.expense[data.expense.length - 1].id + 1;
            } else {
                ID = 0
            }

            //Create a new Expense item based on the new ID
            newExpense = new Expense(ID, des, val);

            //Push the new expense into the data structure
            data.expense.push(newExpense);

            //Return the new expense
            return newExpense;
        },

        calculateBudget: () => {
            //calculate total expenses
            totalExpense();

            //Calculate balance
            data.balance = data.budget - data.totalExpense;

            //calculate the percentage of the total expense
            if(data.budget > 0) {
                data.percentage = Math.round((data.totalExpense / data.budget) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        getBudget: () => {
            return{
                totalExpense: data.totalExpense,
                percentage: data.percentage,
                balance: data.balance
            }
        },

        deleteItem: (id) => {
            let ids, index;
            //Loop through the items and get their ids
            ids = data.expense.map(el => {
                return el.id;
            });

            //Get the index of the ids
            index = ids.indexOf(id);

            //Delete an item based on the item id index
            if(index !== -1) {
                data.expense.splice(index, 1);
            }
        },

        calculateItemPercentage: () => {
            data.expense.forEach(el => {
               el.percentagePerItem(data.budget); 
            });
        },

        getPercentages: () => {
            const percentageAll = data.expense.map(el => {
                return el.getPercentage();
            });
            return percentageAll;
        },

        testing: () => {
            console.log(data);
        }
    }

})();


let UIController = (() => {

    const formatNumber = (num) => {
        let int, dec, splitNum;

        num = Math.abs(num);
        num = num.toFixed(2);

        splitNum = num.split('.');
        int = splitNum[0];
        

        // if(int > 3) {
        //     int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        // }

        if(int.length === 4) {
            int = int.substr(0, 1) + ',' + int.substr(1, 3);
        } else if(int.length === 5) {
            int = int.substr(0, 2) + ',' + int.substr(2, 3);
        } else if(int.length === 6) {
            int = int.substr(0, 3) + ',' + int.substr(3, 3);
        }  else if(int.length === 7) {
            int = int.substr(0, 1) + ',' + int.substr(1, 3) + ',' + int.substr(4, 3);
        } else if(int.length === 8) {
            int = int.substr(0, 2) + ',' + int.substr(2, 3) + ',' + int.substr(5, 3);
        }
        
        dec = splitNum[1];

        return `${int}.${dec}`;
    };

    return{
        getBudgetInput: () => {
            return{
                 value: parseInt(document.querySelector('.budget__input--value').value)
            } 
        },

        displayBudgetValue: (obj) => {
            document.querySelector('.budget__value--amount').textContent = `${formatNumber(obj)}`;
        },

        clearInputField: () => {
            let fields, fieldsArr;
            fields = document.querySelectorAll('.budget__input--value' + ', ' + '.budget__entry--description' + ', ' + '.budget__entry--value');

            fieldsArr = Array.from(fields);

            fieldsArr.forEach(cur => {
                cur.value = '';
            });
            
        },

        getExpenseInput: () => {
            return {
                description: document.querySelector('.budget__entry--description').value,
                value: parseInt(document.querySelector('.budget__entry--value').value)
            }
        },

        listItem: (obj) => {
            const markup = `
                <div class="item clearfix" id="expense-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right">
                        <div class="item__value">${formatNumber(obj.value)}</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="far fa-times-circle"></i></button>
                        </div>
                    </div>
                </div>
            `;
            document.querySelector('.budget__expense--list').insertAdjacentHTML('beforeend', markup);
        },

        displayBudget: (obj) => {
            document.querySelector('.budget__expense--amount').textContent = `${formatNumber(obj.totalExpense)}`;
            document.querySelector('.budget__balance--amount').textContent = `${formatNumber(obj.balance)}`;

            if(obj.percentage > 0) {
                document.querySelector('.budget__expense-percentage').textContent = obj.percentage + '%';
            } else {
                document.querySelector('.budget__expense-percentage').textContent = '---';
            }
        },

        removeListItem: (childID) => {
            let el = document.getElementById(childID);
            el.parentElement.removeChild(el)
        },

        displayPercentage: (obj) => {
            let percentageFields, percentageFieldsArr;
            //Select all the percentage fields
           percentageFields = document.querySelectorAll('.item__percentage');

           //Convert all fields(nodeList) to an array
            percentageFieldsArr = Array.from(percentageFields);

            //Loop through the array and Render the percentages to the UI
            percentageFieldsArr.forEach((el, i) => {
                if(obj[i] > 0) {
                    el.textContent = `${obj[i]}%`;
                } else{
                    el.textContent = `...`;
                }
            });
        }
    }
})();


let appController = ((budgetCtrl, UICtrl) => {

    let eventListeners = () => {
        document.querySelector('.budget__input--icon').addEventListener('click', ctrlAddBudget);

        document.querySelector('.budget__input--btn').addEventListener('click', ctrlAddExpense);

        document.querySelector('.budget__expense--list').addEventListener('click', ctrlDeleteItem);
    };

    const ctrlDeleteItem = (e) => {
        let itemID, splitID, exp, ID;

        itemID = e.target.parentElement.parentElement.parentElement.parentElement.id;
        // console.log(itemID);

        if(itemID) {
            splitID = itemID.split('-');
            exp = splitID[0];
            ID = parseInt(splitID[1]); 

            //Delete item from the data structure
            budgetCtrl.deleteItem(ID);

            //Delete item from the UI
            UICtrl.removeListItem(itemID);

            //Update budget
            updateBudget();

            //Update percentages
            updatePercentages();
        }
    };
    
    const ctrlAddBudget = () => {
        let input, budget;
        //Get the budget value from the UI
        input = UICtrl.getBudgetInput();

        if(input.value > 0 && input.value !== NaN) {
            //Add the budget to the to the budget Controller
            budget = budgetCtrl.addBudget(input.value);

            //Add the budget to the UI
            UICtrl.displayBudgetValue(budget);

            //Clear the input field
            UICtrl.clearInputField();
        }
    };

    const ctrlAddExpense = () => {
        let exp, newExpense;
        //Get the input value from the UI
        exp = UICtrl.getExpenseInput();

        if(exp.description !== '' && exp.value > 0 && exp.value !== NaN) {
            //Add the values to the budget controller
            newExpense = budgetCtrl.addExpense(exp.description, exp.value);

            //Add the budget to the UI
            UICtrl.listItem(newExpense);

            //clear fields
            UICtrl.clearInputField();

            //Update budget
            updateBudget();

            //update percentages
            updatePercentages();
        }
    };

    let updateBudget = () => {
        let budget;
        //calculate Budget
        budgetCtrl.calculateBudget();

        //Get budget
        budget = budgetCtrl.getBudget();

        //Display budget
        UICtrl.displayBudget(budget);
    };

    let updatePercentages = () => {
        let percentage;
        //Calculate Percentages
        budgetCtrl.calculateItemPercentage();

        //Return percentages from the budget controller
        percentage = budgetCtrl.getPercentages();

        //Display percentages
        UICtrl.displayPercentage(percentage);
    };

    
    return {
        init: () => {
            eventListeners();
            UICtrl.displayBudget({
                totalExpense: 0,
                percentage: 0,
                balance: 0
            });
            console.log('Application has started!');
        }
    }
    
})(budgetController, UIController);

appController.init();