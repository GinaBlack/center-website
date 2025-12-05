import { Mail, Phone, MapPin } from "lucide-react";
import logo from "../assets/images/logo.png";
import LanguageSwitcher from '../component/languageSwitcher';

export function Footer() {
  const navigateTo = (page: string) => {
    window.location.hash = page;
  }

  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="tracking-tight">3D Printing High-Tech Center</span>

            </div>
            <LanguageSwitcher />
          </div>

          <div>
            <h3 className="mb-4">Services</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigateTo("services")} className="hover:text-foreground">
                  FDM Printing
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo("services")} className="hover:text-foreground">
                  Resin Printing
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo("services")} className="hover:text-foreground">
                  3D Scanning
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo("workshops")} className="hover:text-foreground">
                  Training
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigateTo("learning")} className="hover:text-foreground">
                  Learning Center
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo("file-guidelines")} className="hover:text-foreground">
                  File Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo("materials")} className="hover:text-foreground">
                  Material Library
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo("pricing")} className="hover:text-foreground">
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                enspy.cep@polytechnique.cm
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                (+237) 222 22 45 47, 694 70 56 90, 677 46 99 21, 697 39 63 01
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>123 Innovation Drive<br />San Francisco, CA 94102</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 3D Printing High-Tech Center. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}