function Validator(formSelector) {
  var formRules = {};
  var _this = this;

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  //   Quy ước :
  // 1. Nếu có lỗi thì return messages
  // 2. Nếu không có lỗi thì return undefined
  var validatorRules = {
    required: function (value) {
      return value ? undefined : 'Vui lòng nhập trường này';
    },
    email: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : 'Trường này phải là email';
    },
    min: function (min) {
      return function (value) {
        return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`;
      };
    },
  };

  // Lấy ra form element trong DOM theo formSelector
  var formElement = document.querySelector(formSelector);

  // Chỉ xử lý khi có element trong DOM
  if (formElement) {
    var inputs = formElement.querySelectorAll('[name][rules]');

    for (var input of inputs) {
      var ruleInfo;
      var rules = input.getAttribute('rules').split('|');

      for (var rule of rules) {
        var isRuleHasValue = rule.includes(':');

        if (rule.includes(':')) {
          ruleInfo = rule.split(':');
          rule = ruleInfo[0];
        }
        var ruleFunc = validatorRules[rule];

        if (isRuleHasValue) {
          ruleFunc = ruleFunc(ruleInfo[1]);
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      }
      // Lắng nghe sự kiện
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }
    // Hàm thực hiện validate
    function handleValidate(event) {
      var rules = formRules[event.target.name];
      var errorMessage;

      for (var rule of rules) {
        errorMessage = rule(event.target.value);
        if (errorMessage) {
          break;
        }
      }

      // Nếu có lỗi
      if (errorMessage) {
        var formGroup = getParent(event.target, '.form-group');

        if (formGroup) {
          formGroup.classList.add('invalid');

          var formMessage = formGroup.querySelector('.form-message');
          if (formMessage) {
            formMessage.innerHTML = errorMessage;
          }
        }
      }
      return !errorMessage;
    }
    // Hàm clear error messages
    function handleClearError(event) {
      var formGroup = getParent(event.target, '.form-group');
      if (formGroup.classList.contains('invalid')) {
        formGroup.classList.remove('invalid');

        var formMessage = formGroup.querySelector('.form-message');
        if (formMessage) {
          formMessage.innerHTML = '';
        }
      }
    }
  }
  // Xử lý hành vi submit form
  formElement.onsubmit = function (event) {
    event.preventDefault();

    var inputs = formElement.querySelectorAll('[name][rules]');
    var isValid = true;

    for (var input of inputs) {
      if (!handleValidate({ target: input })) {
        var isValid = false;
      }
    }
    // Khi không có lỗi thì submit form

    if (isValid) {
      // Trường hợp submit form với JS
      if (typeof _this.onSubmit === 'function') {
        var enableInput = formElement.querySelectorAll('[name]:not([disable]');
        var formValue = Array.from(enableInput).reduce(function (values, input) {
          switch (input.type) {
            case 'checkbox':
              // Không checked thì cho value là một mảng
              if (!values[input.name]) values[input.name] = [];
              // Nếu checked thì push vào mảng
              if (input.checked) values[input.name].push(input.value);
              // Kiểm tra nếu là mảng rỗng thì gán là chuỗi ''
              if (values[input.name].length === 0) values[input.name] = '';
              break;

            case 'radio':
              // Chưa tối ưu code
              values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
              break;
            default:
              values[input.name] = input.value;
          }
          return values;
        }, {});
        _this.onSubmit(formValue);
        // Trường hợp submit form với HTML
      } else {
        formElement.submit();
      }
    }
  };
}
