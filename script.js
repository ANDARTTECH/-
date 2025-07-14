document.addEventListener('DOMContentLoaded', () => {

    // --- АНИМАЦИИ, МЕНЮ, FAQ ---

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                if (entry.target.classList.contains('bork-counter')) {
                    animateCounter(entry.target);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.bork-reveal, .bork-fade, .bork-text-reveal, .bork-counter').forEach(el => {
        observer.observe(el);
    });

    function animateCounter(element) {
        const target = parseFloat(element.getAttribute('data-target'));
        const duration = 2000;
        let startTimestamp = null;
    
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = progress * target;
            
            const isInt = target % 1 === 0;
            let displayValue;
    
            if (isInt) {
                displayValue = Math.floor(current).toLocaleString('ru-RU');
            } else {
                // Форматируем с 2 знаками после запятой, заменяя точку
                displayValue = current.toFixed(2).replace('.', ',');
            }
            
            element.textContent = displayValue;
    
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Устанавливаем точное конечное значение
                element.textContent = target.toLocaleString('ru-RU', {
                    minimumFractionDigits: isInt ? 0 : 2,
                    maximumFractionDigits: isInt ? 0 : 2
                }).replace('.', ',');
            }
        };
        window.requestAnimationFrame(step);
    }

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    document.querySelectorAll('.faq-item').forEach(item => {
        const button = item.querySelector('button');
        const answer = item.querySelector('.faq-answer');
    
        button.addEventListener('click', () => {
            const wasOpen = item.classList.contains('active-card');
    
            document.querySelectorAll('.faq-item.active-card').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('active-card');
                    openItem.querySelector('button').classList.remove('active');
                    openItem.querySelector('.faq-answer').style.maxHeight = null;
                }
            });
    
            if (wasOpen) {
                item.classList.remove('active-card');
                button.classList.remove('active');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('active-card');
                button.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
    

    const calculatorSection = document.getElementById('calculator');
if (calculatorSection) {
    const familySizeInput = document.getElementById('family-size');
    const familySizeValue = document.getElementById('family-size-value');
    const showerDurationInput = document.getElementById('shower-duration');
    const showerDurationValue = document.getElementById('shower-duration-value');
    const regionSelect = document.getElementById('region');
    const showerTypeSelect = document.getElementById('shower-type');
    const resultsOutput = document.getElementById('results-output');
    const paybackPeriodEl = document.getElementById('payback-period');
    const moneySavedEl = document.getElementById('money-saved');
    const waterSavedEl = document.getElementById('water-saved');
    const energySavedEl = document.getElementById('energy-saved');
    const analogyEl = document.getElementById('analogy');
    const moneyBar = document.getElementById('money-bar');
    const waterBar = document.getElementById('water-bar');
    const energyBar = document.getElementById('energy-bar');
    const loaderContainer = document.getElementById('calculator-loader-container');

    const VODOLEY_RETAIL_PRICE = 199000;
    const TARIFFS = {
        moscow: { water: 0.051, energy: 6.9 },
        spb: { water: 0.039, energy: 6.3 },
        novosibirsk: { water: 0.023, energy: 3.36 },
        russia: { water: 0.04, energy: 5.5 }
    };
    const SHOWER_TYPES = {
        standard: 12,
        tropical: 20
    };
    const VODOLEY_CONSUMPTION = {
        water: 5,
        dryer_energy_per_use: 0.2
    };
    const WASHING_SAVINGS = {
        water: 50,
        energy: 0.8,
        detergent: 30
    };

    function formatNumber(num) {
        return Math.round(num).toLocaleString('ru-RU');
    }

    function calculateSavings() {
        // Удаляем ссылку на несуществующий resultsPlaceholder
        
        const familySize = parseInt(familySizeInput.value);
        const showerDuration = parseInt(showerDurationInput.value);
        const region = regionSelect.value;
        const showerType = showerTypeSelect.value;
        
        const tariffs = TARIFFS[region];
        const oldShowerWaterPerMin = SHOWER_TYPES[showerType];
        const washesPerWeek = Math.ceil(familySize / 2);

        const waterSavedPerDay = familySize * showerDuration * (oldShowerWaterPerMin - VODOLEY_CONSUMPTION.water);
        const energyForHeatingSavedPerDay = waterSavedPerDay * 0.07;
        
        const towelWaterSavedPerYear = washesPerWeek * 52 * WASHING_SAVINGS.water;
        const towelEnergySavedPerYear = washesPerWeek * 52 * WASHING_SAVINGS.energy;
        const towelDetergentSavedPerYear = washesPerWeek * 52 * WASHING_SAVINGS.detergent;
        
        const dryerEnergyPerDay = familySize * VODOLEY_CONSUMPTION.dryer_energy_per_use;
        
        const totalWaterSavedYear = (waterSavedPerDay * 365) + towelWaterSavedPerYear;
        const totalEnergySavedYear = (energyForHeatingSavedPerDay * 365) + towelEnergySavedPerYear - (dryerEnergyPerDay * 365);
        const totalMoneySavedYear = (totalWaterSavedYear * tariffs.water) + (totalEnergySavedYear * tariffs.energy) + towelDetergentSavedPerYear;
        
        const paybackMonths = totalMoneySavedYear > 0 ? Math.round(VODOLEY_RETAIL_PRICE / (totalMoneySavedYear / 12)) : Infinity;

        // Показываем результаты
        if (resultsOutput) {
            resultsOutput.classList.remove('hidden');
        }

        paybackPeriodEl.textContent = isFinite(paybackMonths) ? `Окупаемость: ~ ${paybackMonths} месяцев` : 'Окупаемость невозможна';
        moneySavedEl.textContent = `${formatNumber(totalMoneySavedYear)} ₽`;
        waterSavedEl.textContent = `${formatNumber(totalWaterSavedYear)} л`;
        energySavedEl.textContent = `${formatNumber(totalEnergySavedYear)} кВт·ч`;

        // Анимируем полоски
        setTimeout(() => {
            moneyBar.style.width = `${Math.min(100, (totalMoneySavedYear / 50000) * 100)}%`;
            waterBar.style.width = `${Math.min(100, (totalWaterSavedYear / 100000) * 100)}%`;
            energyBar.style.width = `${Math.min(100, (totalEnergySavedYear / 5000) * 100)}%`;
        }, 100);
        
        const bathtubs = Math.round(totalWaterSavedYear / 200);
        analogyEl.textContent = `За год вы сэкономите столько воды, сколько нужно для наполнения ${bathtubs} стандартных ванн.`;
    }

    // Обновляем значения при изменении слайдеров


    // Обработчик кнопки "Рассчитать экономию"
    if (calculatorSection) {
        // ... здесь остаются строки с объявлением переменных ...
        const familySizeInput = document.getElementById('family-size');
        // ... и так далее ...
    
    
        // === НАЧАЛО НОВОГО БЛОКА (вставляется сюда) ===
        const controls = [familySizeInput, showerDurationInput, regionSelect, showerTypeSelect];
    
        // Обновляем текст (цифру) рядом с ползунком во время движения
        familySizeInput.addEventListener('input', () => {
            familySizeValue.textContent = familySizeInput.value;
        });
        showerDurationInput.addEventListener('input', () => {
            showerDurationValue.textContent = showerDurationInput.value;
        });
    
        // Запускаем полный перерасчет экономии при любом изменении
        controls.forEach(control => {
            const eventType = control.type === 'range' ? 'input' : 'change';
            control.addEventListener(eventType, calculateSavings);
        });
    
        // Вызываем расчет один раз при загрузке страницы, чтобы показать начальные цифры
        calculateSavings();
        // === КОНЕЦ НОВОГО БЛОКА ===
    }
}

    // --- КОНТАКТНАЯ ФОРМА ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const successMessage = document.getElementById('form-success-message');
        const submitButton = contactForm.querySelector('button');
        
        // Собираем данные из формы
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';

        try {
            // Замените URL на ваш серверный обработчик или сервис типа Formspree
            const response = await fetch('https://formspree.io/f/movlaqlr', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Ошибка отправки');

            // Показываем сообщение об успехе
            contactForm.style.display = 'none';
            successMessage.classList.remove('hidden');

        } catch (error) {
            console.error('Ошибка формы:', error);
            alert('Не удалось отправить сообщение. Попробуйте позже.');
            submitButton.disabled = false;
            submitButton.textContent = 'Отправить запрос';
        }
    });
}
    
}); 
// --- Логика кнопки "Наверх" (обновленная) ---
const backToTopButton = document.getElementById('back-to-top');

if (backToTopButton) {
  window.addEventListener('scroll', () => {
    // Показываем кнопку после прокрутки на 300px
    if (window.scrollY > 300) {
      backToTopButton.classList.add('is-visible');
    } else {
      backToTopButton.classList.remove('is-visible');
    }
  });

  // Плавная прокрутка наверх по клику
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
// --- Эффект "прожектора" для карточек ---
document.querySelectorAll('.bork-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});
