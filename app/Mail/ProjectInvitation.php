<?php

namespace App\Mail;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProjectInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Project $project,
        public ProjectMember $member,
        public User $invitedBy,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->invitedBy->name . ' te invitó al proyecto "' . $this->project->name . '"',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.project-invitation',
            with: [
                'acceptUrl'   => url('/invite/' . $this->member->invitation_token),
                'projectName' => $this->project->name,
                'inviterName' => $this->invitedBy->name,
                'roleName'    => match ($this->member->role) {
                    'manager'     => 'Manager',
                    'contributor' => 'Colaborador',
                    'viewer'      => 'Observador',
                    default       => $this->member->role,
                },
            ],
        );
    }
}
