from setuptools import setup

setup(
    name='arcas',
    version='2.1.1',
    packages=['src'],
    entry_points={
        'console_scripts': [
            'arcas = src.cli:main'
        ]
    })
