// =====================================
// SBFENT MOBILE NAVIGATION
// =====================================

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        const isOpen =
            navMenu.classList.toggle("active");

        document.body.classList.toggle(
            "menu-open",
            isOpen
        );

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen
        );

    });


    // Close mobile menu after clicking a link

    document.querySelectorAll(
        ".nav-menu a"
    ).forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");

            document.body.classList.remove(
                "menu-open"
            );

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}


// =====================================
// SBFENT HEADER SCROLL EFFECT
// =====================================

const header =
    document.querySelector(".site-header");

window.addEventListener("scroll", () => {

    if (!header) return;

    if (window.scrollY > 40) {

        header.style.background =
            "rgba(3,3,3,0.95)";

    } else {

        header.style.background =
            "rgba(3,3,3,0.82)";

    }

});


// =====================================
// SIMPLE REVEAL ANIMATION
// =====================================

const revealElements =
    document.querySelectorAll(
        ".section-heading, .artist-card, .stamp-panel, .info-card, .media-card, .contact-box"
    );

const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (
                    entry.isIntersecting
                ) {

                    entry.target.style.opacity =
                        "1";

                    entry.target.style.transform =
                        "translateY(0)";

                    observer.unobserve(
                        entry.target
                    );

                }

            });

        },
        {
            threshold: 0.12
        }
    );


revealElements.forEach(element => {

    element.style.opacity = "0";

    element.style.transform =
        "translateY(25px)";

    element.style.transition =
        "opacity 0.7s ease, transform 0.7s ease";

    observer.observe(element);

});
