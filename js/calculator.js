/* ===== CLEANRU — Calculator ===== */
(function () {
  'use strict';

  // Base rate per m² depending on service
  const SERVICE_RATES = {
    standard:  { name: 'Поддерживающая уборка', base: 70 },
    general:   { name: 'Генеральная уборка',    base: 130 },
    repair:    { name: 'Уборка после ремонта',  base: 180 },
    window:    { name: 'Мытьё окон',            base: 90 },
    office:    { name: 'Офисная уборка',        base: 60 },
    move:      { name: 'Уборка после переезда', base: 150 },
  };

  // Room-type multiplier
  const ROOM_TYPES = {
    apartment: { name: 'Квартира',     mult: 1.0  },
    house:     { name: 'Частный дом',  mult: 1.15 },
    office:    { name: 'Офис',         mult: 0.95 },
    commercial:{ name: 'Коммерческое помещение', mult: 1.1 },
  };

  const EXTRAS = {
    windows:   { name: 'Мытьё окон',           price: 1500 },
    fridge:    { name: 'Уборка холодильника',  price: 800  },
    oven:      { name: 'Чистка духовки',       price: 1000 },
    balcony:   { name: 'Уборка балкона',       price: 1200 },
    ironing:   { name: 'Глажка белья',         price: 700  },
    chemistry: { name: 'Химчистка дивана',     price: 2500 },
  };

  const URGENCY_MULT = { normal: 1, urgent: 1.25 };

  const $ = (sel, root = document) => root.querySelector(sel);

  const calc = $('#calc-form');
  if (!calc) return;

  const fmt = n => n.toLocaleString('ru-RU') + ' ₽';

  function compute() {
    const area = Math.max(1, parseInt($('#calc-area').value || 0, 10) || 0);
    const room = ROOM_TYPES[($('input[name="room"]:checked') || {}).value] || ROOM_TYPES.apartment;
    const service = SERVICE_RATES[($('input[name="service"]:checked') || {}).value] || SERVICE_RATES.standard;
    const urgency = ($('input[name="urgency"]:checked') || {}).value || 'normal';
    const urgMult = URGENCY_MULT[urgency];

    let extrasTotal = 0;
    const chosenExtras = [];
    document.querySelectorAll('input[name="extra"]:checked').forEach(cb => {
      const e = EXTRAS[cb.value];
      if (e) { extrasTotal += e.price; chosenExtras.push(e.name); }
    });

    const baseCost = area * service.base * room.mult;
    let subtotal = baseCost + extrasTotal;
    let total = subtotal * urgMult;

    // Loyalty discount on big areas
    let discount = 0;
    if (area >= 100) { discount = total * 0.07; total -= discount; }

    // Update summary
    const list = $('#calc-summary');
    list.innerHTML = '';
    addRow(list, 'Тип помещения', room.name);
    addRow(list, 'Услуга', service.name);
    addRow(list, 'Площадь', area + ' м²');
    addRow(list, 'Базовая стоимость', fmt(Math.round(baseCost)));
    if (chosenExtras.length) addRow(list, 'Доп. услуги', chosenExtras.join(', '));
    if (extrasTotal) addRow(list, 'Стоимость доп. услуг', fmt(extrasTotal));
    if (urgency === 'urgent') addRow(list, 'Срочный заказ', '+25%');
    if (discount) addRow(list, 'Скидка от 100 м²', '−' + fmt(Math.round(discount)));

    $('#calc-total').textContent = fmt(Math.round(total));
    // Pass total into hidden field on order form (if present)
    const hidden = $('#calc-total-hidden');
    if (hidden) hidden.value = Math.round(total);
  }

  function addRow(ul, label, value) {
    const li = document.createElement('li');
    li.innerHTML = `${label}<span>${value}</span>`;
    ul.appendChild(li);
  }

  // React to any input change
  calc.addEventListener('input', compute);
  calc.addEventListener('change', compute);

  // Initial calc
  compute();

  // Order submit
  const orderBtn = $('#calc-order');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      const name = $('#calc-name').value.trim();
      const phone = $('#calc-phone').value.trim();
      if (!name || phone.replace(/\D/g, '').length < 10) {
        showToast('Заполните имя и корректный телефон', 'error');
        return;
      }
      showToast(`Заявка принята, ${name}! Стоимость: ${$('#calc-total').textContent}`);
      $('#calc-name').value = '';
      $('#calc-phone').value = '';
    });
  }
})();
