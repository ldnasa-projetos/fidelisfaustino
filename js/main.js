/* Fidelis & Faustino: native navigation, local form preview and once-only motion. */
(() => {
  'use strict';

  const trigger = document.querySelector('#menu-trigger');
  const menu = document.querySelector('#site-menu');
  const header = document.querySelector('.site-header');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const menuLinks = [...menu.querySelectorAll('a')];
  let menuOpen = false;

  function setMenu(open, restoreFocus = true) {
    menuOpen = open;
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    main.inert = open;
    footer.inert = open;
    if (open) menuLinks[0]?.focus({ preventScroll: true });
    else if (restoreFocus) trigger.focus({ preventScroll: true });
  }

  trigger.addEventListener('click', () => setMenu(!menuOpen));
  menu.addEventListener('click', event => {
    if (event.target === menu) setMenu(false);
  });
  menuLinks.forEach(link => link.addEventListener('click', () => setMenu(false, false)));
  header.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    if (menuOpen) setMenu(false, false);
  }));
  document.addEventListener('keydown', event => {
    if (!menuOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false);
    }
    if (event.key === 'Tab') {
      const focusable = [...header.querySelectorAll('a,button'), ...menuLinks];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  const message = document.querySelector('#contact-message');
  let previousTopic = '';

  document.querySelectorAll('[data-contact-topic]').forEach(link => {
    link.addEventListener('click', () => {
      if(!message||!status)return;
      const topic = link.dataset.contactTopic;
      const previousValue = previousTopic ? `Gostaria de conversar sobre: ${previousTopic}.` : '';
      if (!message.value.trim() || message.value === previousValue) {
        message.value = `Gostaria de conversar sobre: ${topic}.`;
        previousTopic = topic;
      }
      status.hidden = true;
      status.textContent = '';
    });
  });

  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent = 'Demonstração concluída. Nenhuma mensagem foi enviada.';
    status.hidden = false;
  });
  // Enable only after the local handler exists; without JavaScript no data can be submitted.
  if(form)form.querySelector('button[type="submit"]').disabled = false;
  form?.addEventListener('input', () => {
    status.hidden = true;
    status.textContent = '';
  });

  document.querySelectorAll('[data-open-dialog]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.openDialog);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const activeAnimations = new Set();
  function showAll() {
    observer?.disconnect();
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
    document.querySelectorAll('.reveal-pending').forEach(element => element.classList.remove('reveal-pending'));
  }

  if (!motionPreference.matches && typeof Element.prototype.animate === 'function') {
    const tokens = getComputedStyle(document.documentElement);
    const value = name => tokens.getPropertyValue(name).trim();
    const milliseconds = name => {
      const raw = value(name);
      return raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000;
    };
    // Sample a critically damped spring: no overshoot, no added motion dependency.
    // Durations and delays match the approved reference; this is not Framer's engine.
    const response = parseFloat(value('--motion-spring-response'));
    const end = 1 - (1 + response) * Math.exp(-response);
    const frames = Array.from({ length: 61 }, (_, index) => {
      const time = index / 60;
      return { offset: time, progress: (1 - (1 + response * time) * Math.exp(-response * time)) / end };
    });
    function play(element, keyframes, duration, delay = 0) {
      const animation = element.animate(keyframes, { duration, delay, fill: 'both', easing: 'linear' });
      activeAnimations.add(animation);
      animation.onfinish = () => {
        activeAnimations.delete(animation);
        animation.cancel();
      };
    }
    function entrance(element, offset, delay = 0) {
      play(element, frames.map(frame => ({
        offset: frame.offset,
        opacity: frame.progress,
        transform: `translateX(calc(${offset} * ${1 - frame.progress}))`
      })), milliseconds('--motion-duration-hero'), delay);
    }
    document.querySelectorAll('[data-hero]').forEach(element => {
      const name = element.dataset.hero;
      const delayNames = { eyebrow: 'eyebrow', title: 'title', body: 'body', action: 'action' };
      entrance(element, value('--motion-offset-entry'), milliseconds(`--motion-delay-${delayNames[name]}`));
    });
    const panorama = document.querySelector('[data-panorama]');
    function revealPanorama() {
      if(!panorama)return;
      const startScale = parseFloat(value('--motion-scale-image-start'));
      const finalScale = parseFloat(value('--motion-image-scale-final'));
      const curtain = document.createElement('span');
      curtain.className = 'panorama-curtain';
      curtain.setAttribute('aria-hidden', 'true');
      panorama.append(curtain);
      play(panorama.querySelector('img'), frames.map(frame => ({
        offset: frame.offset,
        opacity: frame.progress,
        // token-audit-disable-next-line: Interpolate between the two approved image-scale tokens using normalized spring progress.
        transform: `scale(${finalScale + (startScale - finalScale) * (1 - frame.progress)})`
      })), milliseconds('--motion-duration-panorama'));
      const animation = curtain.animate(frames.map(frame => ({
        offset: frame.offset,
        // token-audit-disable-next-line: The curtain travels exactly its own height; percent is normalized spring geometry, not a visual size.
        transform: `translateY(${frame.progress * 100}%)`
      })), { duration: milliseconds('--motion-duration-panorama'), fill: 'both', easing: 'linear' });
      activeAnimations.add(animation);
      animation.onfinish = () => { activeAnimations.delete(animation); curtain.remove(); };
      animation.oncancel = () => curtain.remove();
    }
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove('reveal-pending');
          if (entry.target === panorama) revealPanorama();
          else entrance(entry.target, value('--motion-reveal-offset'));
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('[data-reveal]').forEach(element => {
        element.classList.add('reveal-pending');
        observer.observe(element);
      });
      if(panorama)observer.observe(panorama);
    } else {
      revealPanorama();
    }
  }
  motionPreference.addEventListener('change', event => {
    if (event.matches) showAll();
  });
  // Anchor jumps and keyboard focus must always expose their destination immediately.
  document.addEventListener('focusin', event => {
    const hiddenParent = event.target.closest('.reveal-pending');
    if (hiddenParent) {
      hiddenParent.classList.remove('reveal-pending');
      observer?.unobserve(hiddenParent);
    }
  });

  const backTop=document.querySelector('.back-to-top');
  if(backTop&&'IntersectionObserver' in window){
    new IntersectionObserver(entries=>{backTop.hidden=!entries[0].isIntersecting;},{threshold:0}).observe(footer);
    backTop.addEventListener('click',event=>{event.preventDefault();window.scrollTo({top:0,behavior:motionPreference.matches?'instant':'smooth'});document.querySelector('h1').setAttribute('tabindex','-1');document.querySelector('h1').focus({preventScroll:true});});
  }
  // Separate parent transform prevents conflicts with the hero entrance animation.
  const parallax=document.querySelector('.panorama-parallax');
  const panoramaFrame=document.querySelector('[data-panorama]');
  const heroMetrics=document.querySelector('.hero-metrics');
  if(heroMetrics&&!motionPreference.matches)heroMetrics.classList.add('motion-gated');
  function startMetricCounters(){
    const items=[...heroMetrics.querySelectorAll('[data-count]')];
    const raw=getComputedStyle(document.documentElement).getPropertyValue('--motion-counter-duration').trim();
    const duration=raw.endsWith('ms')?parseFloat(raw):parseFloat(raw)*1000;
    const start=performance.now();
    function tick(now){
      const progress=motionPreference.matches?1:Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-progress,3);
      for(const item of items){const count=Math.floor(Number(item.dataset.count)*eased);item.textContent=item.dataset.prefix+count.toLocaleString('pt-BR')+item.dataset.suffix;}
      if(progress<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  let metricsRevealed=false;
  let scheduled=false;
  function updateParallax(){
    scheduled=false;
    if(!parallax)return;
    if(motionPreference.matches){parallax.style.transform='none';heroMetrics?.classList.remove('motion-gated');return;}
    const rect=panoramaFrame.getBoundingClientRect();
    if(rect.bottom<0||rect.top>innerHeight)return;
    if(heroMetrics&&!metricsRevealed&&Math.abs(rect.top+rect.height/2-innerHeight/2)<innerHeight*.16){
      metricsRevealed=true;heroMetrics.classList.add('is-visible');startMetricCounters();
    }
    const styles=getComputedStyle(document.documentElement);
    const travel=parseFloat(styles.getPropertyValue('--motion-parallax-travel'));
    const scale=parseFloat(styles.getPropertyValue('--motion-parallax-scale'));
    const progress=Math.max(-1,Math.min(1,(innerHeight/2-rect.top-rect.height/2)/((innerHeight+rect.height)/2)));
    parallax.style.transform=`translateY(${progress*rect.height*travel}px) scale(${scale})`;
  }
  function queueParallax(){if(!scheduled){scheduled=true;requestAnimationFrame(updateParallax);}}
  window.addEventListener('scroll',queueParallax,{passive:true});
  window.addEventListener('resize',queueParallax,{passive:true});
  motionPreference.addEventListener('change',queueParallax);
  queueParallax();
})();
