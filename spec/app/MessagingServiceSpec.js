MessagingService = require('../../app/MessagingService');

describe('MessagingService', () => {
    let subject;

    let channelServiceSpy, slackClientSpy;

    beforeEach(() => {
        channelServiceSpy = jasmine.createSpyObj('channelService',
            ['getDmUcid']
        );

        slackClientSpy = jasmine.createSpyObj('slackClient',
            [
                'writeToChannel',
                'writeToChannelWithSelectionAttachment'
            ]);

        subject = new MessagingService(channelServiceSpy, slackClientSpy);
    });

    describe('notifyStanduppersOfSelection', () => {
        it('should use the slackClient to sendMessage each standupper', () => {
            let su1 = {slackName: 'name1', slackDmUcid: '123'};
            let su2 = {slackName: 'name2', slackDmUcid: '456'};
            let su3 = {slackName: 'name3', slackDmUcid: '789'};

            subject.notifyStanduppersOfSelection([su1, su2, su3], 'msg');

            expect(slackClientSpy.writeToChannelWithSelectionAttachment.calls.count())
                .toEqual(3);
            expect(slackClientSpy.writeToChannelWithSelectionAttachment.calls.allArgs())
                .toEqual([
                    ['msg', '123', 'name1'],
                    ['msg', '456', 'name2'],
                    ['msg', '789', 'name3']
                ])
        });

    });

    describe('sendMessage', () => {
        it('should use the slackClient to write to the correct channel', () => {
            let standupper = {
                slackDmUcid: '12345'
            };

            subject.sendMessage(standupper, 'msg');

            expect(slackClientSpy.writeToChannel).toHaveBeenCalledWith('msg', '12345');
        });
    });

    describe('notifyOfSelection', () => {
        it('should use the slackClient to write to the correct channel', () => {
            let standupper = {
                slackName: 'name',
                slackDmUcid: '12345'
            };

            subject.notifyOfSelection(standupper, 'msg');

            expect(slackClientSpy.writeToChannelWithSelectionAttachment)
                .toHaveBeenCalledWith('msg', '12345', 'name');
        });

        describe('when the standupper does not have a dmucid', () => {
            it('should use the channelService to retrieve one', () => {
                let standupper = {
                    slackName: 'name',
                    slackDmUcid: undefined,
                    email: 'email@email.com'
                };

                channelServiceSpy.getDmUcid.and.returnValue('12345');

                subject.notifyOfSelection(standupper, 'msg');

                expect(channelServiceSpy.getDmUcid).toHaveBeenCalledWith(standupper.email);
                expect(slackClientSpy.writeToChannelWithSelectionAttachment)
                    .toHaveBeenCalledWith('msg', '12345', 'name');
            });
        });
    });
});