import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 shadow-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 hidden sm:block">HOR</h3>
            </div>
            <p className="text-gray-600 max-w-md">
              Find the perfect place away from home with our trusted rental marketplace.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm" onClick={() => window.location.href = '#host'}>
                  Become a Host
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-orange-100 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5 text-gray-700" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5 text-gray-700" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-pink-100 rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5 text-gray-700" />
              </a>
              <a href="mailto:support@hor.com" className="w-10 h-10 bg-gray-100 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                <Mail className="w-5 h-5 text-gray-700" />
              </a>
            </div>
            <p className="text-sm text-gray-500">support@hor.com</p>
          </div>
        </div>

        {/* Bottom border & Copyright */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 HOR. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
