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

export const settings = (stateManager: SourceStateManager): NavigationButton => {
    return createNavigationButton({
        id: 'settings',
        value: '',
        label: 'Content Settings',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.all([
                    stateManager.store('languages', values.languages),
                ]).then()
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'content',
                        footer: 'When enabled, same chapters from different scanlation group will not be shown.',
                        rows: () => {
                            return Promise.all([
                                getLanguages(stateManager),
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