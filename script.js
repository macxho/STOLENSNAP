    /* ─────────────────────────────────────
       SUPABASE CONFIG — fill these in
       Table name: photos
       Columns: id, url, category (text), label (text)
    ───────────────────────────────────── */
    const SUPABASE_URL = 'YOUR_SUPABASE_URL';
    const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    /* ── Polaroid rendering ── */
    const grid   = document.getElementById('polaroidGrid');
    const empty  = document.getElementById('workEmpty');
    let   allPhotos = [];

    async function loadPhotos() {
      // Show skeletons while loading
      grid.innerHTML = Array(12).fill(0).map(() => `
        <div class="polaroid-skeleton">
          <div class="skel-img"></div>
          <div class="skel-label"></div>
        </div>
      `).join('');

      const { data, error } = await sb
        .from('photos')
        .select('*')
        .order('id', { ascending: true })
        .limit(30);

      if (error || !data?.length) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
      }

      allPhotos = data;
      renderPhotos('all');
    }

    function renderPhotos(cat) {
      const filtered = cat === 'all' ? allPhotos : allPhotos.filter(p => p.category === cat);
      grid.innerHTML = '';

      if (!filtered.length) {
        empty.style.display = 'block';
        return;
      }

      empty.style.display = 'none';
      filtered.forEach(photo => {
        const div = document.createElement('div');
        div.className = 'polaroid visible';
        div.innerHTML = `
          <img src="${photo.url}" alt="${photo.label || ''}" loading="lazy" />
          <span class="polaroid-label">${photo.label || ''}</span>
        `;
        grid.appendChild(div);
      });
    }

    /* ── Category tabs ── */
    document.getElementById('catTabs').addEventListener('click', e => {
      const btn = e.target.closest('.cat-tab');
      if (!btn) return;
      document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPhotos(btn.dataset.cat);
    });

    /* ── Active nav on scroll ── */
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.cam-links a');

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const a = document.querySelector(`.cam-links a[href="#${e.target.id}"]`);
          if (a) a.classList.add('active');
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => obs.observe(s));

    /* ── Init ── */
    loadPhotos();