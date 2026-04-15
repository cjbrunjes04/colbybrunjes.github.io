const STORAGE_KEY = 'networkingTrackerContacts';

window.addEventListener('DOMContentLoaded', () => {
  console.log('Script loaded and DOM ready.');
  const form = document.getElementById('contact-form');
  console.log('Form element:', form);
  const contactsBody = document.getElementById('contacts-body');
  const savedCards = document.getElementById('saved-cards');
  const contactCount = document.getElementById('contact-count');
  const cancelButton = document.getElementById('cancel-button');
  const currentIndex = document.getElementById('current-index');
  const saveButton = document.getElementById('save-button');
  const EDIT_INDEX_KEY = 'networkingTrackerEditIndex';

  const fields = {
    person: document.getElementById('person'),
    firm: document.getElementById('firm'),
    linkedin: document.getElementById('linkedin'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    lastContact: document.getElementById('lastContact'),
    priority: document.getElementById('priority'),
    nextAction: document.getElementById('nextAction'),
    details: document.getElementById('details'),
    deadline: document.getElementById('deadline'),
  };

  console.log('Fields found:', {
    person: fields.person,
    firm: fields.firm,
    linkedin: fields.linkedin,
    phone: fields.phone,
    email: fields.email,
    lastContact: fields.lastContact,
    priority: fields.priority,
    nextAction: fields.nextAction,
    details: fields.details,
    deadline: fields.deadline,
  });

  function loadContacts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load contacts:', error);
      return [];
    }
  }

  function saveContacts(contacts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }

  function getFormData() {
    return {
      person: fields.person ? fields.person.value.trim() : '',
      firm: fields.firm ? fields.firm.value.trim() : '',
      linkedin: fields.linkedin ? fields.linkedin.value.trim() : '',
      phone: fields.phone ? fields.phone.value.trim() : '',
      email: fields.email ? fields.email.value.trim() : '',
      lastContact: fields.lastContact ? fields.lastContact.value : '',
      priority: fields.priority ? fields.priority.value : '',
      nextAction: fields.nextAction ? fields.nextAction.value.trim() : '',
      details: fields.details ? fields.details.value.trim() : '',
      deadline: fields.deadline ? fields.deadline.value.trim() : '',
    };
  }

  function validateForm(data) {
    return data.person.length > 0 && data.firm.length > 0;
  }

  function clearForm() {
    if (form) {
      form.reset();
      if (fields.priority) fields.priority.value = '';
    }
    setEditingIndex(-1);
  }

  function updateCounter(count) {
    if (contactCount) {
      contactCount.textContent = `${count} contact${count === 1 ? '' : 's'}`;
    }
  }

  function setEditingIndex(index) {
    const normalizedIndex = index >= 0 ? index : -1;
    if (currentIndex) currentIndex.value = String(normalizedIndex);
    if (saveButton) saveButton.textContent = normalizedIndex >= 0 ? 'Save changes' : 'Add contact';
    if (cancelButton) cancelButton.hidden = normalizedIndex < 0;
  }

  function populateForm(contact, index) {
    if (!form || !contact) return;
    if (fields.person) fields.person.value = contact.person || '';
    if (fields.firm) fields.firm.value = contact.firm || '';
    if (fields.linkedin) fields.linkedin.value = contact.linkedin || '';
    if (fields.phone) fields.phone.value = contact.phone || '';
    if (fields.email) fields.email.value = contact.email || '';
    if (fields.lastContact) fields.lastContact.value = contact.lastContact || '';
    if (fields.priority) fields.priority.value = contact.priority || '';
    if (fields.nextAction) fields.nextAction.value = contact.nextAction || '';
    if (fields.details) fields.details.value = contact.details || '';
    if (fields.deadline) fields.deadline.value = contact.deadline || '';
    setEditingIndex(index);
    form.scrollIntoView({ behavior: 'smooth' });
  }

  function scheduleEditOnHome(index) {
    localStorage.setItem(EDIT_INDEX_KEY, String(index));
    window.location.href = 'index.html';
  }

  function loadPendingEditIndex() {
    const stored = localStorage.getItem(EDIT_INDEX_KEY);
    if (stored === null) return -1;
    localStorage.removeItem(EDIT_INDEX_KEY);
    return Number(stored);
  }

  function createActionButton(label, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  }

  function handleEdit(index) {
    const contacts = loadContacts();
    if (index < 0 || index >= contacts.length) return;
    if (form) {
      populateForm(contacts[index], index);
    } else {
      scheduleEditOnHome(index);
    }
  }

  function handleDelete(index) {
    const contacts = loadContacts();
    if (index < 0 || index >= contacts.length) return;
    if (!confirm('Delete this contact?')) return;
    contacts.splice(index, 1);
    saveContacts(contacts);
    renderContacts();
  }

  function renderContacts() {
    const contacts = loadContacts();
    if (contactsBody) {
      contactsBody.innerHTML = '';
    }
    if (savedCards) {
      savedCards.innerHTML = '';
    }
    updateCounter(contacts.length);

    contacts.forEach((contact, index) => {
      if (contactsBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${contact.person}</td>
          <td>${contact.firm}</td>
          <td>${contact.linkedin || '—'}</td>
          <td>${contact.phone || '—'}</td>
          <td>${contact.email || '—'}</td>
          <td>${contact.lastContact || '—'}</td>
          <td>${contact.priority || '—'}</td>
          <td>${contact.nextAction || '—'}</td>
          <td>${contact.details || '—'}</td>
          <td>${contact.deadline || '—'}</td>
          <td class="actions-cell"></td>
        `;

        const actionsCell = row.querySelector('.actions-cell');
        if (actionsCell) {
          actionsCell.appendChild(
            createActionButton('Edit', 'small-btn edit-btn', () => handleEdit(index))
          );
          actionsCell.appendChild(
            createActionButton('Delete', 'small-btn delete-btn', () => handleDelete(index))
          );
        }

        contactsBody.appendChild(row);
      }

      if (savedCards) {
        const card = document.createElement('div');
        card.className = 'saved-card';
        card.innerHTML = `
          <div class="card-title">
            <h4>${contact.person} • ${contact.firm}</h4>
            <span class="card-pill">${contact.priority || 'No priority'}</span>
          </div>
          <div class="card-row"><span>LinkedIn:</span><span>${contact.linkedin || '—'}</span></div>
          <div class="card-row"><span>Phone:</span><span>${contact.phone || '—'}</span></div>
          <div class="card-row"><span>Email:</span><span>${contact.email || '—'}</span></div>
          <div class="card-row"><span>Last contact:</span><span>${contact.lastContact || '—'}</span></div>
          <div class="card-row"><span>Next action:</span><span>${contact.nextAction || '—'}</span></div>
          <div class="card-row"><span>Details:</span><span>${contact.details || '—'}</span></div>
          <div class="card-row"><span>Deadline:</span><span>${contact.deadline || '—'}</span></div>
        `;

        const cardActions = document.createElement('div');
        cardActions.className = 'card-actions';
        cardActions.appendChild(
          createActionButton('Edit', 'small-btn edit-btn', () => handleEdit(index))
        );
        cardActions.appendChild(
          createActionButton('Delete', 'small-btn delete-btn', () => handleDelete(index))
        );
        card.appendChild(cardActions);

        savedCards.appendChild(card);
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      console.log('Form submit event triggered.');
      event.preventDefault();
      const data = getFormData();
      console.log('Form data:', data);

      if (!validateForm(data)) {
        alert('Please enter at least the Person and Firm before saving.');
        return;
      }

      const contacts = loadContacts();
      const activeIndex = currentIndex ? Number(currentIndex.value) : -1;

      if (activeIndex >= 0 && activeIndex < contacts.length) {
        contacts[activeIndex] = data;
      } else {
        contacts.unshift(data);
      }

      saveContacts(contacts);
      renderContacts();
      clearForm();
      console.log('Contact saved and form cleared.');
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      clearForm();
    });
  }

  renderContacts();

  const pendingEditIndex = loadPendingEditIndex();
  if (pendingEditIndex >= 0 && form) {
    const contacts = loadContacts();
    const contactToEdit = contacts[pendingEditIndex];
    if (contactToEdit) {
      populateForm(contactToEdit, pendingEditIndex);
    }
  }
});
