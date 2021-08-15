/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    NavigationButton,
    Section,
    SourceStateManager,
} from 'paperback-extensions-common'
import {
    NHLanguages,
} from './NHentaiHelper'

export const getLanguages = async (stateManager: SourceStateManager): Promise<string[]> => {
    return (await stateManager.retrieve('languages') as string[]) ?? NHLanguages.getDefault()
}

export const getExtraArgs = async (stateManager: SourceStateManager): Promise<string> => {
    return (await stateManager.retrieve('extra_args') as string) ?? ""
}

export const settings = (stateManager: SourceStateManager): NavigationButton => {
    return createNavigationButton({
        id: 'settings',
        value: '',
        label: 'Content Settings',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.all([
                    stateManager.store('languages', values.languages),
                    stateManager.store('extra_args', values.extra_args),
                ]).then()
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'content',
                        footer: 'Modify the nhentai experience to your liking.',
                        rows: () => {
                            return Promise.all([
                                getLanguages(stateManager),
                                getExtraArgs(stateManager),
                            ]).then(async values => {
                                return [
                                    createSelect({
                                        id: 'languages',
                                        label: 'Languages',
                                        options: NHLanguages.getNHCodeList(),
                                        displayLabel: option => NHLanguages.getName(option),
                                        value: values[0],
                                        allowsMultiselect: false,
                                        minimumOptionCount: 1,
                                    }),
                                    createInputField({
                                        id: 'extra_args',
                                        label: 'Additional arguments',
                                        placeholder: "woman -lolicon -shotacon -yaoi",
                                        maskInput: false,
                                        value: values[1],
                                    })
                                ]
                            })
                        }
                    })
                ])
            }
        })
    })
}

export const resetSettings = (stateManager: SourceStateManager): Button => {
    return createButton({
        id: 'reset',
        label: 'Reset to Default',
        value: '',
        onTap: () => {
            return Promise.all([
                stateManager.store('languages', null),
            ]).then()
        }
    })
}