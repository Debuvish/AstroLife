
const navbarLinks = document.querySelectorAll('.navbar a');

navbarLinks.forEach(link => {
    link.addEventListener('click', function() {
        navbarLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});


const logo = document.querySelector('.logo');
logo.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


const chatBtn = document.querySelector('.btn-box a:nth-child(1)');
chatBtn.addEventListener('click', function(e) {
    alert('Opening AstroLife Chat...');
});
