// b. Just Be Theme JavaScript

class CartDrawer {
    constructor() {
        this.drawer = document.getElementById('cart-drawer');
        this.overlay = document.getElementById('cart-drawer-overlay');
        this.toggleButtons = document.querySelectorAll('[data-cart-toggle]');
        this.closeButtons = document.querySelectorAll('[data-cart-close]');

        this.init();
    }

    init() {
        // Toggle cart drawer
        this.toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.open());
        });

        // Close cart drawer
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => this.close());
        });

        // Close on overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }

        // Handle quantity updates
        document.addEventListener('click', (e) => {
            const updateBtn = e.target.closest('[data-cart-update]');
            if (updateBtn) {
                e.preventDefault();
                const key = updateBtn.dataset.cartUpdate;
                const qty = parseInt(updateBtn.dataset.qty);
                this.updateItem(key, qty);
            }
        });
    }

    open() {
        this.drawer.classList.add('is-open');
        if (this.overlay) {
            this.overlay.style.display = 'block';
            setTimeout(() => {
                this.overlay.style.opacity = '1';
            }, 10);
        }
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.drawer.classList.remove('is-open');
        if (this.overlay) {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.style.display = 'none';
            }, 300);
        }
        document.body.style.overflow = '';
    }

    async updateItem(key, quantity) {
        try {
            const response = await fetch(window.routes.cart_change_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: key,
                    quantity: quantity
                })
            });

            const cart = await response.json();
            this.refreshCart(cart);
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    }

    refreshCart(cart) {
        // Update cart count
        const cartCounts = document.querySelectorAll('[data-cart-count]');
        cartCounts.forEach(count => {
            count.textContent = cart.item_count;
        });

        // Update cart total
        const cartTotals = document.querySelectorAll('[data-cart-total]');
        cartTotals.forEach(total => {
            total.textContent = this.formatMoney(cart.total_price);
        });

        // Reload cart drawer content
        this.reloadDrawer();
    }

    async reloadDrawer() {
        try {
            const response = await fetch(window.location.href);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newDrawer = doc.getElementById('cart-drawer');

            if (newDrawer && this.drawer) {
                this.drawer.innerHTML = newDrawer.innerHTML;
            }
        } catch (error) {
            console.error('Error reloading cart:', error);
        }
    }

    formatMoney(cents) {
        return '$' + (cents / 100).toFixed(2);
    }
}

// Product Form Handler
class ProductForm {
    constructor(form) {
        this.form = form;
        this.submitButton = form.querySelector('[type="submit"]');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const originalButtonText = this.submitButton.textContent;

        this.submitButton.textContent = 'Adding...';
        this.submitButton.disabled = true;

        try {
            const response = await fetch(window.routes.cart_add_url, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.status === 422) {
                throw new Error(data.description);
            }

            // Success - open cart drawer
            this.submitButton.textContent = 'Added!';

            // Refresh cart and open drawer
            if (window.cartDrawer) {
                await window.cartDrawer.reloadDrawer();
                window.cartDrawer.open();
            }

            setTimeout(() => {
                this.submitButton.textContent = originalButtonText;
                this.submitButton.disabled = false;
            }, 1000);

        } catch (error) {
            console.error('Error adding to cart:', error);
            this.submitButton.textContent = 'Error - Try Again';
            setTimeout(() => {
                this.submitButton.textContent = originalButtonText;
                this.submitButton.disabled = false;
            }, 2000);
        }
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#!') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart drawer
    window.cartDrawer = new CartDrawer();

    // Initialize product forms
    document.querySelectorAll('form[action*="/cart/add"]').forEach(form => {
        new ProductForm(form);
    });

    // Initialize smooth scroll
    initSmoothScroll();

    // Add overlay element if it doesn't exist
    if (!document.getElementById('cart-drawer-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'cart-drawer-overlay';
        overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 99;
      display: none;
      opacity: 0;
      transition: opacity 300ms ease;
    `;
        document.body.appendChild(overlay);
    }
});
