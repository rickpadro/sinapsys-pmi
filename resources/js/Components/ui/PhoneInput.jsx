import { useState } from 'react';

const COUNTRIES = [
    { code: 'MX', flag: '🇲🇽', name: 'México',      dial: '52'  },
    { code: 'US', flag: '🇺🇸', name: 'USA',          dial: '1'   },
    { code: 'CA', flag: '🇨🇦', name: 'Canadá',       dial: '1'   },
    { code: 'ES', flag: '🇪🇸', name: 'España',       dial: '34'  },
    { code: 'CO', flag: '🇨🇴', name: 'Colombia',     dial: '57'  },
    { code: 'AR', flag: '🇦🇷', name: 'Argentina',    dial: '54'  },
    { code: 'CL', flag: '🇨🇱', name: 'Chile',        dial: '56'  },
    { code: 'PE', flag: '🇵🇪', name: 'Perú',         dial: '51'  },
    { code: 'VE', flag: '🇻🇪', name: 'Venezuela',    dial: '58'  },
    { code: 'EC', flag: '🇪🇨', name: 'Ecuador',      dial: '593' },
    { code: 'GT', flag: '🇬🇹', name: 'Guatemala',    dial: '502' },
    { code: 'CR', flag: '🇨🇷', name: 'Costa Rica',   dial: '506' },
    { code: 'PA', flag: '🇵🇦', name: 'Panamá',       dial: '507' },
    { code: 'BO', flag: '🇧🇴', name: 'Bolivia',      dial: '591' },
    { code: 'PY', flag: '🇵🇾', name: 'Paraguay',     dial: '595' },
    { code: 'UY', flag: '🇺🇾', name: 'Uruguay',      dial: '598' },
    { code: 'BR', flag: '🇧🇷', name: 'Brasil',       dial: '55'  },
    { code: 'DO', flag: '🇩🇴', name: 'R. Dominicana',dial: '1809'},
    { code: 'GB', flag: '🇬🇧', name: 'Reino Unido',  dial: '44'  },
    { code: 'DE', flag: '🇩🇪', name: 'Alemania',     dial: '49'  },
    { code: 'FR', flag: '🇫🇷', name: 'Francia',      dial: '33'  },
    { code: 'IT', flag: '🇮🇹', name: 'Italia',       dial: '39'  },
];

// Recibe value (número completo sin +, ej: "525510502831") y llama onChange con el nuevo valor completo
export default function PhoneInput({ value = '', onChange, placeholder = '55 1234 5678', error = false }) {
    // Detectar país actual desde el valor almacenado
    function detectCountry(fullNumber) {
        if (!fullNumber) return COUNTRIES[0];
        const digits = fullNumber.replace(/\D/g, '');
        // Buscar el dial code más largo que coincida al inicio
        const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
        return sorted.find(c => digits.startsWith(c.dial)) ?? COUNTRIES[0];
    }

    const [country, setCountry] = useState(() => detectCountry(value));

    // Número local (sin código de país)
    const localNumber = value
        ? value.replace(/\D/g, '').replace(new RegExp('^' + country.dial), '')
        : '';

    function handleCountryChange(dial) {
        const newCountry = COUNTRIES.find(c => c.dial === dial) ?? COUNTRIES[0];
        setCountry(newCountry);
        // Recalcular número completo con nuevo código
        onChange(newCountry.dial + localNumber);
    }

    function handleLocalChange(e) {
        const digits = e.target.value.replace(/\D/g, '');
        onChange(country.dial + digits);
    }

    return (
        <div className="flex gap-1.5">
            {/* Country selector */}
            <select
                value={country.dial}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="shrink-0 rounded-lg border px-2 py-2.5 text-sm outline-none focus:ring-2"
                style={{
                    backgroundColor: 'var(--background)',
                    borderColor: error ? 'var(--destructive)' : 'var(--border)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)',
                    width: '90px',
                }}
            >
                {COUNTRIES.map((c) => (
                    <option key={c.code + c.dial} value={c.dial}>
                        {c.flag} +{c.dial}
                    </option>
                ))}
            </select>

            {/* Local number input */}
            <input
                type="tel"
                value={localNumber}
                onChange={handleLocalChange}
                placeholder={placeholder}
                className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2"
                style={{
                    backgroundColor: 'var(--background)',
                    borderColor: error ? 'var(--destructive)' : 'var(--border)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)',
                }}
            />
        </div>
    );
}
