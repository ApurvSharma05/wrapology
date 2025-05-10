# PackagePro - Packaging Solutions Website

This is a responsive e-commerce website for a packaging products company, similar to Boxify. The website is built using HTML, CSS, and JavaScript.

## Features

- Responsive design that works on desktops, tablets, and mobile devices
- Clean and modern UI with smooth animations
- Product categories and listings
- Interactive navigation with dropdowns
- Search functionality
- Contact and partnership forms
- Newsletter subscription
- Mobile-friendly navigation

## Files and Structure

- `index.html` - Main HTML file containing the website structure
- `styles.css` - CSS stylesheet for styling the website
- `script.js` - JavaScript file for adding interactivity
- `images/` - Directory for storing website images

## How to Use

1. Clone or download this repository
2. Open the `index.html` file in your web browser to view the website
3. Customize the content, styling, and functionality to fit your needs

## Customization

### Changing Colors

The primary color scheme can be modified in the `styles.css` file:

```css
/* Primary color: #4a90e2 */
/* Secondary color: #357abd */
/* Text color: #333 */
/* Light background: #f8f8f8 */
```

### Adding Products

To add new products to the website, duplicate the product card HTML structure in the `index.html` file:

```html
<div class="product-card">
    <div class="product-image">
        <img src="path-to-image.jpg" alt="Product">
    </div>
    <div class="product-info">
        <h3>Product Name</h3>
        <p class="price">₹XX.XX</p>
        <a href="#" class="btn-small">View</a>
    </div>
</div>
```

### Replacing Images

Replace the placeholder images with your actual product images:

1. Add your images to the `images/` directory
2. Update the `src` attributes in the HTML to point to your images

## Browser Compatibility

This website is compatible with modern browsers including:

- Chrome
- Firefox
- Safari
- Edge

## License

This project is available for personal and commercial use.

## Credits

- Font Awesome for icons
- Placeholder images via placeholder.com 