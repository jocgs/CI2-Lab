import Image from "next/image";
import { SignInButton } from "@/components/SignInButton";
import { BRAND_ASSETS, HERO_ASSETS } from "@/lib/constants/assets";

export default function LoginPage() {
  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .login-shell {
          width: min(1100px, 96vw);
          max-height: calc(100vh - 48px);
          display: grid;
          grid-template-columns: minmax(400px, 0.95fr) minmax(420px, 1fr);
          gap: 0;
          border-radius: 32px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 22px 55px rgba(0,0,0,0.12);
        }
        .login-visual-panel {
          background: #b8e5c3;
          overflow: hidden;
        }
        .login-visual-panel img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
        }
        .login-form-panel {
          background: #ffffff;
          border-left: 1px solid rgba(16,185,129,0.12);
          padding: 40px 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .login-brand {
          text-align: center;
          margin-bottom: 28px;
        }
        .login-brand img {
          width: 52px;
          height: 52px;
          display: block;
          margin: 0 auto 10px;
          object-fit: contain;
        }
        .login-brand h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .login-brand p {
          margin: 8px auto 0;
          max-width: 380px;
          font-size: 14px;
          color: rgba(17,24,39,0.60);
          line-height: 1.45;
        }
        @media (max-width: 900px) {
          .login-page {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
            padding: 16px;
          }
          .login-shell {
            display: block;
            width: 100%;
            max-width: 520px;
            max-height: none;
            border-radius: 28px;
          }
          .login-visual-panel {
            display: none;
          }
          .login-form-panel {
            padding: 32px 24px;
            border-left: none;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-shell">

          {/* Panel visual izquierdo */}
          <div className="login-visual-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HERO_ASSETS.login} alt="" />
          </div>

          {/* Panel formulario derecho */}
          <div className="login-form-panel">
            <div className="login-brand">
              <Image
                src={BRAND_ASSETS.logoIconTransparent}
                alt="TikiTaka"
                width={52}
                height={52}
                priority
                unoptimized
              />
              <h1>TikiTaka</h1>
              <p>Haz porras de fútbol con amigos y compite por el ranking.</p>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Acceder</h2>
            <p style={{ fontSize: 13, color: "rgba(17,24,39,0.55)", margin: "4px 0 0" }}>
              Crea una cuenta o entra con tu email.
            </p>
            <SignInButton />
          </div>

        </div>
      </div>
    </>
  );
}
