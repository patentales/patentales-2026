const header = document.getElementById('site-header');
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('nav-mobile');

// scroll behavior
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

// hamburger toggle
hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('is-open');
  hamburger.classList.toggle('is-open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// close menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

// detect language from URL path
const lang = window.location.pathname.includes('/nl/') ? 'nl' : 'en';

// load team members
fetch('../assets/team.json')
  .then(res => res.json())
  .then(members => {
    const grid = document.getElementById('team-grid');
    grid.innerHTML = members.map(member => `
      <div class="team-member">
        <img src="${member.photo}" alt="${member.name}" class="team-photo">
        <h3 class="team-name">${member.name}</h3>
        <p class="team-role">${member.role[lang]}</p>
        <p class="team-bio">${member.bio[lang]}</p>
        <div class="team-links">
          <a href="${member.linkedin}" target="_blank" rel="noopener" aria-label="${member.name} on LinkedIn">
            <img src="../assets/images/icon-linkedin.svg" alt="" class="team-link-icon">
          </a>
          <a href="mailto:${member.email}" aria-label="Email ${member.name}">
            <img src="../assets/images/icon-mail.svg" alt="" class="team-link-icon">
          </a>
        </div>
      </div>
    `).join('');
  })
  .catch(err => console.error('Could not load team data:', err));


//load quotes
fetch('../assets/quotes.json')
  .then(res => res.json())
  .then(quotes => {
    const track = document.getElementById('quotes-track');
    const dotsContainer = document.getElementById('quotes-dots');
    let current = 0;

    // build slides
    track.innerHTML = quotes.map(q => `
      <div class="quote-slide">
        <img src="${q.photo}" alt="${q.name}" class="quote-photo">
        <div class="quote-content">
          <div class="quote-stars">${'★'.repeat(q.stars)}</div>
          <p class="quote-text">"${q.quote[lang]}"</p>
          <div class="quote-attribution">
            <div>
              <p class="quote-name">${q.name}</p>
              <p class="quote-role">${q.role[lang]}</p>
            </div>
            <div class="quote-divider"></div>
            <img src="${q.logo}" alt="${q.logoAlt}" class="quote-logo">
          </div>
        </div>
      </div>
    `).join('');

    // build dots
    dotsContainer.innerHTML = quotes.map((_, i) => `
      <button class="quotes-dot ${i === 0 ? 'is-active' : ''}"
              aria-label="Go to quote ${i + 1}"></button>
    `).join('');

    const dots = dotsContainer.querySelectorAll('.quotes-dot');

    function updateDots(index) {
      dots.forEach(d => d.classList.remove('is-active'));
      dots[index].classList.add('is-active');
    }

    function goTo(index) {
      current = (index + quotes.length) % quotes.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      updateDots(current);
    }

    function goToAnimated(index) {
      const next = (index + quotes.length) % quotes.length;

      // if wrapping forward (last -> first), animate to a virtual slide
      // then snap back
      if (current === quotes.length - 1 && next === 0) {
        // temporarily add a clone slide at the end
        const clone = track.children[0].cloneNode(true);
        track.appendChild(clone);
        track.style.transition = 'transform 0.5s ease';
        track.style.transform = `translateX(-${quotes.length * 100}%)`;

        setTimeout(() => {
          // snap back to real first slide
          track.style.transition = 'none';
          track.style.transform = `translateX(0%)`;
          current = 0;
          updateDots(0);
          // remove the clone
          track.removeChild(clone);
          // re-enable transition after snap
          setTimeout(() => {
            track.style.transition = 'transform 0.5s ease';
          }, 50);
        }, 500);
      } else {
        current = next;
        track.style.transform = `translateX(-${current * 100}%)`;
        updateDots(current);
      }
    }

    // set initial transition
    track.style.transition = 'transform 0.5s ease';

    document.getElementById('quotes-prev').addEventListener('click', () => goTo(current - 1));
    document.getElementById('quotes-next').addEventListener('click', () => goToAnimated(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  })
  .catch(err => console.error('Could not load quotes:', err));