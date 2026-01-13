import React from 'react';
import './Footer.css';
import iconX from '../assets/x_logo.png';
import iconYoutube from '../assets/YouTube_logo.png';
import iconInstagram from '../assets/inst_logo.png';

const Footer = () => {
    const scrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="app-footer">
        <div className="footer-inner">
            <div className="footer-section company">
            <div className="company-name">E-Shop Company</div>
            <div className="company-tag">Quality goods — delivered fast</div>
            </div>

            <div className="footer-section socials">
            <div className="footer-title">Follow us</div>
            <div className="social-links">
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="X">
                    <img src={iconX} alt="X" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <img src={iconYoutube} alt="YouTube" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <img src={iconInstagram} alt="Instagram" />
                </a>
            </div>
            </div>

            <div className="footer-section contacts">
            <div className="footer-title">Contact</div>
            <div className="contact-item">Phone: +1234567890</div>
            <div className="contact-item">Email: eshop@eshop.com</div>
            </div>

            <div className="footer-section to-top">
            <button className="to-top-btn" onClick={scrollTop} aria-label="Scroll to top" style={{ width: '50px', height: '50px', borderRadius: '50%', fontSize: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
            </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} E-Shop Company. All rights reserved.</div>
        </footer>
    );
};

export default Footer;
