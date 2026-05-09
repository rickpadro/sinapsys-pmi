import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { useUrl } from '@/Lib/utils';
import WizardNav from '@/Components/CreateWizard/WizardNav';
import StepTemplate from '@/Components/CreateWizard/StepTemplate';
import StepProjectData from '@/Components/CreateWizard/StepProjectData';
import StepConfirm from '@/Components/CreateWizard/StepConfirm';

export default function CreateWizard({ templates }) {
    const url  = useUrl();
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        template_id:          '',
        methodology:          '',
        default_view:         'list',
        name:                 '',
        type:                 'interno',
        priority:             3,
        color:                '#4A6CF7',
        description:          '',
        phase:                0,
        impact:               5,
        effort:               5,
        viability_mercado:    5,
        viability_financiero: 5,
        viability_tecnico:    5,
        viability_riesgo:     5,
        tags:                 [],
        links:                [],
    });

    const selectedTemplate = templates.find(t => t.id === Number(data.template_id));

    function selectTemplate(template) {
        setData(prev => ({
            ...prev,
            template_id:  template.id,
            methodology:  template.slug,
            default_view: template.default_view,
        }));
        setStep(2);
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(url('/projects'));
    }

    return (
        <AppLayout title="Nuevo Proyecto">
            <div className="mx-auto max-w-2xl">
                <WizardNav step={step} />

                <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                    {step === 1 && (
                        <StepTemplate
                            templates={templates}
                            selectedId={Number(data.template_id)}
                            onSelect={selectTemplate}
                        />
                    )}

                    {step === 2 && (
                        <StepProjectData
                            data={data}
                            setData={setData}
                            errors={errors}
                            onNext={() => setStep(3)}
                            onBack={() => setStep(1)}
                        />
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSubmit}>
                            <StepConfirm
                                data={data}
                                selectedTemplate={selectedTemplate}
                                processing={processing}
                                onBack={() => setStep(2)}
                            />
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
