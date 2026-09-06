// DATA MODELS (Blending Claude's logic with Stitch's aesthetics)

const MENU_ITEMS = [
    {
        id: 1,
        title: "45-Day Dry Aged Ribeye",
        desc: "Charred on volcanic rock, served with bone marrow butter.",
        price: "$82.00",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEbJj3t5XVqu3YJrJzJC-NmjzlLDtWbSomrtmmKY87CPg67jd8JARsL8P25vp0eVdw9XI73LEzHDr8yxye-O86EdMrtEenedyXHdKbHkUPQEmXij7NXkK59md_3o0_qGq5goV7_XQ87UUKZkNHDI2BPqkgt23dhRWhZEblbZQjLB7wnn56j4WqlAWNJdflpylmlqtmYybyjchCEhOcQp3NPbuVo-uYK7LoOgRULg_qnTt9VcsGAu_7ZDDtEiJGBU6tWvp6INFuNdT9",
        tag: "SIGNATURE",
        span: 2
    },
    {
        id: 2,
        title: "Citrus Salmon",
        desc: "Seared block with yuzu emulsion.",
        price: "$42.00",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDg1-pIE1iNInTbbCEbkqgCCzlj4F8u0GNB9WsuEFIsBAIzHNezif-5sF8d3Kr_RwCzJnqtXVc2GJx38XiXdAmTUe_--jYcfwQxYPNWnDG55YC6_LSpuhYzs-f8IjkiyB-SWdHZkqQT2EyMZC-swwZsUehVi11NJ9UFh7OQ-ODsbj5dIqUkbwwSvaIHd-3Hpq8tpDRQsO8tl9KHK5boZW7oHTSqPDxYbZuIArugFYYhavGsKZkv01oPsfX1yGH26m2um5Cb1i39eKUn",
        tag: "",
        span: 1
    },
    {
        id: 3,
        title: "Truffle Tagliatelle",
        desc: "Hand rolled pasta, shaved black truffle.",
        price: "$38.00",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRMAtm21mvd3uDMtLECQh11XFT_Rq1048NXju7q_iE4eInHVvzg8R-Si4bx6gTsxQC3WJGEIokdwx_n9HbRpImlimtWJNvyj_ZMgOn2OZ2vtt_aIz_GMuBowgqHqvGz9cyqlfNRpt7KQNG6yfXHnarRXDJ9kVvdK_s_RwjCv2L5LF2yEGqlGEKSBzCoEcTqOP7dTjHKUJdzpw7efyNMiLN0sKV51cgZqu1sWIZW6hbeaZck9pNpLOpkrIXdyIV9acF_mL4TNjMs0dv",
        tag: "",
        span: 1
    },
    {
        id: 4,
        title: "Classic Smash Burger",
        desc: "Prime beef, artisanal brioche.",
        price: "$28.00",
        img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1599&auto=format&fit=crop",
        tag: "POPULAR",
        span: 1
    },
    {
        id: 5,
        title: "Heritage Tomato Salad",
        desc: "Burrata, aged balsamic, micro basil.",
        price: "$22.00",
        img: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=1600&auto=format&fit=crop",
        tag: "FRESH",
        span: 1
    }
];

const BEVERAGE_ITEMS = [
    { title: "Vesper Martini", price: "$22.00", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_ErlJPbhLGO_0Rw3HXfSjxZPJB7T0DyF6Nn9s_kje6QTN1c0j19DHxm9pSYhJLmQJCSVmjZhEy4pPEfY7zm-u5BX6lXkYW8k-iA91-N5hgo0AlV_FzIY218R8PYpPWv5_7aqD__MTDlTOU4YmBFb1pwPzGTgOvlDIQHoBLuAvjvcgJK5poLMjzLRmUFRnMTl5v-8r--hxKuv5q64qNw8onxWnDcDY6NjzDxYpplGpeBm4hTjgpkUMBPVhh6RSt-Ud8yGtcqsLPpcB" },
    { title: "Smoked Old Fashioned", price: "$26.00", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1600&auto=format&fit=crop" },
    { title: "Matcha Yuzu Elixir", price: "$14.00", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=1600&auto=format&fit=crop" },
    { title: "Cold Brew Reserve", price: "$12.00", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=1599&auto=format&fit=crop" }
];

const TABLES = [
    { id: "01", status: "occupied", guests: 4, bill: "$324.50", type: "VIP" },
    { id: "02", status: "available", guests: 0, bill: "$0.00", type: "Standard" },
    { id: "04", status: "alert", guests: 2, bill: "$142.00", type: "Standard" },
    { id: "08", status: "occupied", guests: 6, bill: "$890.20", type: "Premium" },
    { id: "12", status: "available", guests: 0, bill: "$0.00", type: "Patio" }
];

// NAVIGATION LOGIC
function goPage(pageId) {
    // Update pages
    document.querySelectorAll('.page-sec').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
        // force reflow
        void p.offsetWidth; 
    });
    
    // Update links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    // Activate target
    const target = document.getElementById('page-' + pageId);
    if(target) {
        target.style.display = 'flex'; // For flex layout pages
        if(pageId === 'menu' || pageId === 'beverages' || pageId === 'tables' || pageId === 'analytics') {
            target.style.display = 'block'; // Block for grid layouts
        }
        target.classList.add('active');
        
        // Highlight correct nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => {
            if(l.innerText.toLowerCase().includes(pageId) || (pageId==='home' && l.innerText==='Home')) {
                l.classList.add('active');
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// RENDERING
function renderMenu() {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = MENU_ITEMS.map((m, i) => `
        <div class="group relative overflow-hidden rounded-[2rem] bg-surface-high border-t-2 border-transparent hover:border-primary food-card-hover ${m.span === 2 ? 'md:col-span-2' : ''}" style="animation: fadeUp 0.6s ease forwards; animation-delay: ${0.1 * i}s; opacity: 0;">
            <div class="aspect-[${m.span === 2 ? '21/9' : 'square'}] overflow-hidden bg-surface-higher">
                <img src="${m.img}" alt="${m.title}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105">
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
            <div class="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end z-10">
                <div class="space-y-2">
                    ${m.tag ? `<span class="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold tracking-widest rounded-full uppercase">${m.tag}</span>` : ''}
                    <h2 class="${m.span === 2 ? 'text-3xl' : 'text-xl'} font-headline font-semibold text-white">${m.title}</h2>
                    ${m.span === 2 ? `<p class="text-text2 text-sm max-w-md">${m.desc}</p>` : ''}
                </div>
                <div class="flex flex-col items-end">
                    <span class="font-mono text-${m.span === 2 ? '3xl' : 'xl'} font-bold text-primary golden-glow-text">${m.price}</span>
                    <button class="mt-4 bg-surface hover:bg-primary text-white hover:text-surface p-3 rounded-xl transition-all duration-300">
                        <span class="material-symbols-outlined">add</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderBeverages() {
    const grid = document.getElementById('beverages-grid');
    grid.innerHTML = BEVERAGE_ITEMS.map((b, i) => `
        <div class="group relative overflow-hidden rounded-[2rem] bg-surface-high food-card-hover" style="animation: fadeUp 0.6s ease forwards; animation-delay: ${0.1 * i}s; opacity: 0;">
            <div class="aspect-[4/5] overflow-hidden">
                <img src="${b.img}" alt="${b.title}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110">
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-surface/90 to-transparent p-6 flex flex-col justify-end">
                <div class="flex justify-between items-end">
                    <h3 class="text-lg font-headline font-bold text-white max-w-[60%]">${b.title}</h3>
                    <span class="font-mono text-primary font-bold">${b.price}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderTables() {
    const grid = document.getElementById('tables-grid');
    grid.innerHTML = TABLES.map((t, i) => {
        let borderClass = 'border-outline/20 hover:border-outline/50';
        let bgClass = 'bg-surface-high';
        let iconColor = 'text-green-400';
        let icon = 'check_circle';
        let statusBadge = `<span class="px-3 py-1 bg-outline/20 text-text2 rounded-full text-[10px] font-bold tracking-widest uppercase">Available</span>`;
        
        if(t.status === 'occupied') {
            borderClass = 'border-primary/30 hover:border-primary/80';
            iconColor = 'text-primary';
            icon = 'restaurant';
            statusBadge = `<span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold tracking-widest uppercase">Occupied</span>`;
        } else if (t.status === 'alert') {
            borderClass = 'border-red-500/50 hover:border-red-500';
            iconColor = 'text-red-500 animate-pulse';
            icon = 'timer';
            statusBadge = `<span class="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-bold tracking-widest uppercase">Long Wait</span>`;
        }

        return `
        <div class="p-6 rounded-[2rem] border ${borderClass} ${bgClass} transition-all duration-500 relative cursor-pointer transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]" style="animation: fadeUp 0.6s ease forwards; animation-delay: ${0.1 * i}s; opacity: 0;">
            <div class="absolute top-0 right-0 p-6">
                <span class="material-symbols-outlined ${iconColor}">${icon}</span>
            </div>
            <div class="space-y-6">
                <div>
                    <p class="font-headline text-[10px] text-text2 tracking-widest uppercase">TABLE</p>
                    <h2 class="text-5xl font-display font-black text-white">${t.id}</h2>
                    <p class="text-[10px] text-outline mt-1 uppercase tracking-widest">${t.type}</p>
                </div>
                <div class="flex justify-between items-center py-4 border-t border-outline/10">
                    <div class="flex items-center gap-2 text-text1">
                        <span class="material-symbols-outlined text-sm">groups</span>
                        <span class="font-headline text-xs">${t.guests > 0 ? t.guests + ' GUESTS' : 'SEATS UP TO 4'}</span>
                    </div>
                </div>
                <div class="flex justify-between items-end">
                    <div>
                        <p class="font-headline text-[10px] text-text2 tracking-widest uppercase">${t.guests > 0 ? 'CURRENT TAB' : 'STATUS'}</p>
                        ${t.guests > 0 ? `<p class="text-2xl font-mono font-bold text-primary golden-glow-text">${t.bill}</p>` : statusBadge}
                    </div>
                    ${t.guests > 0 ? statusBadge : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    // Set initial active state based on nav logic
    goPage('home');
    renderMenu();
    renderBeverages();
    renderTables();
});
